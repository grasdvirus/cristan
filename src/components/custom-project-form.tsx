
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';
import { Progress } from './ui/progress';

const formSchema = z.object({
  projectName: z.string().min(2, { message: "Le nom du projet est requis." }),
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
  contact: z.string().min(5, { message: "Un contact est requis." }),
  howYouFoundUs: z.string().min(1, { message: "Veuillez sélectionner une option." }),
  projectBrief: z.string().min(20, { message: "Veuillez détailler votre projet (20 caractères min)." }),
});

type FormValues = z.infer<typeof formSchema>;

const steps = [
  { id: 'step1', title: 'Informations sur le projet', fields: ['projectName', 'companyName', 'companyDescription'] },
  { id: 'step2', title: 'Contact & Découverte', fields: ['contact', 'howYouFoundUs'] },
  { id: 'step3', title: 'Cahier des charges', fields: ['projectBrief'] },
];

export function CustomProjectForm() {
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const router = useRouter();
    const [currentStep, setCurrentStep] = React.useState(0);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: '',
            companyName: '',
            companyDescription: '',
            contact: '',
            howYouFoundUs: '',
            projectBrief: '',
        },
    });

    const next = async () => {
        const fields = steps[currentStep].fields as (keyof FormValues)[];
        const output = await form.trigger(fields, { shouldFocus: true });

        if (!output) return;

        if (currentStep < steps.length - 1) {
            setCurrentStep(step => step + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep(step => step - 1);
        }
    };
    
    async function onSubmit(values: FormValues) {
        if (!firestore) {
            toast({ variant: "destructive", title: "Erreur", description: "Le service n'est pas disponible." });
            return;
        }
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...values,
                type: 'Projet Personnalisé',
                userId: user?.uid || "anonymous",
                status: 'Nouveau',
                createdAt: serverTimestamp()
            };
            await addDoc(collection(firestore, "submissions"), submissionData);
            toast({ variant: 'success', title: 'Demande envoyée !', description: 'Nous vous contacterons bientôt.' });
            router.push('/');
        } catch (error) {
            console.error("Error saving submission: ", error);
            toast({ variant: "destructive", title: "Erreur", description: "Impossible d'enregistrer votre demande." });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const progressValue = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="p-6">
      <Progress value={progressValue} className="mb-8" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <AnimatePresence mode="wait">
                 <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                >
                    {currentStep === 0 && (
                        <div className='space-y-6'>
                            <FormField control={form.control} name="projectName" render={({ field }) => (
                                <FormItem><FormLabel>Nom du projet</FormLabel><FormControl><Input placeholder="Ex: Mon application de e-commerce" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="companyName" render={({ field }) => (
                                <FormItem><FormLabel>Nom de l'entreprise (Optionnel)</FormLabel><FormControl><Input placeholder="Ex: Ma Super Entreprise" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="companyDescription" render={({ field }) => (
                                <FormItem><FormLabel>Description de l'entreprise (Optionnel)</FormLabel><FormControl><Textarea placeholder="Décrivez brièvement votre activité..." {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    )}
                    {currentStep === 1 && (
                         <div className='space-y-6'>
                            <FormField control={form.control} name="contact" render={({ field }) => (
                                <FormItem><FormLabel>Contact (Email ou Téléphone)</FormLabel><FormControl><Input placeholder="votre@email.com ou +225 0102030405" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="howYouFoundUs" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comment nous avez-vous connus ?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark">
                                                <SelectValue placeholder="Sélectionnez une source" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="google">Google</SelectItem>
                                            <SelectItem value="facebook">Facebook</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="twitter-x">Twitter (X)</SelectItem>
                                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                                            <SelectItem value="recommendation">Recommandation</SelectItem>
                                            <SelectItem value="other">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    )}
                     {currentStep === 2 && (
                         <div className='space-y-6'>
                            <FormField control={form.control} name="projectBrief" render={({ field }) => (
                                <FormItem><FormLabel>Cahier des charges du projet</FormLabel><FormControl><Textarea rows={8} placeholder="Décrivez en détail les fonctionnalités, le design et les objectifs de votre projet..." {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="flex justify-between pt-4">
                <Button type="button" onClick={prev} className="btn-neumorphic-light dark:btn-neumorphic-dark" disabled={currentStep === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Retour
                </Button>
                
                {currentStep === steps.length - 1 ? (
                    <Button type="submit" className="btn-neumorphic-light dark:btn-neumorphic-dark" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                        {isSubmitting ? 'Envoi...' : 'Soumettre'}
                    </Button>
                ) : (
                     <Button type="button" onClick={next} className="btn-neumorphic-light dark:btn-neumorphic-dark">
                        Suivant <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                )}
            </div>
        </form>
      </Form>
    </div>
  )
}
