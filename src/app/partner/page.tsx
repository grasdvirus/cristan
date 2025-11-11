'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/components/ui/use-toast';
import { useFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { NeumorphicCard } from '@/components/neumorphic-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Handshake, ArrowRight, KeyRound, Plus, Trash2, Send, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AuthGuard } from '@/components/auth-guard';

const PARTNER_CODE = 'CRISTAN-PAT';

const partnerFormSchema = z.object({
  fullName: z.string().min(2, 'Le nom est requis.'),
  email: z.string().email('Email invalide.'),
  phone: z.string().min(8, 'Numéro invalide.'),
  socialLinks: z.array(z.object({ value: z.string().url('URL invalide.') })).min(1, 'Ajoutez au moins un lien social.'),
  promoCode: z.string().min(3, 'Le code doit avoir au moins 3 caractères.').max(15, 'Le code ne doit pas dépasser 15 caractères.'),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

function PartnerForm({ onFormSubmit, isSubmitting }: { onFormSubmit: (values: PartnerFormValues) => void, isSubmitting: boolean }) {
  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      socialLinks: [{ value: '' }],
      promoCode: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  return (
    <AuthGuard>
      <NeumorphicCard className="w-full max-w-2xl mx-auto mt-12">
        <h2 className="text-2xl font-bold font-headline text-center mb-6">Formulaire de Partenariat</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="promoCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code Promo Suggeré</FormLabel>
                    <FormControl>
                      <Input placeholder="EX: CRISTAN10" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="votre@email.com" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+33 6..." {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Réseaux Sociaux</FormLabel>
              <div className="space-y-2 mt-2">
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`socialLinks.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/..." {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark"/>
                          </FormControl>
                          {fields.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append({ value: '' })}
              >
                <Plus className="mr-2 h-4 w-4" /> Ajouter un lien
              </Button>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </Button>
            </div>
          </form>
        </Form>
      </NeumorphicCard>
    </AuthGuard>
  );
}


export default function PartnerPage() {
  const [code, setCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { firestore } = useFirebase();

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PARTNER_CODE) {
      setIsCodeVerified(true);
      toast({
        variant: 'success',
        title: 'Code valide !',
        description: 'Vous pouvez maintenant remplir le formulaire.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Code invalide',
        description: 'Le code que vous avez entré est incorrect.',
      });
    }
  };

  const handleFormSubmit = async (values: PartnerFormValues) => {
      if (!firestore) {
        toast({ title: 'Erreur de base de données', variant: 'destructive' });
        return;
      }
      setIsSubmitting(true);
      try {
        await addDoc(collection(firestore, 'submissions'), {
          ...values,
          socialLinks: values.socialLinks.map(link => link.value),
          type: 'Partenariat',
          createdAt: serverTimestamp(),
        });
        toast({ variant: 'success', title: 'Demande envoyée !', description: 'Nous examinerons votre demande bientôt.' });
        setIsCodeVerified(false); // Hide form after submission
        setCode('');
      } catch (error) {
        toast({ title: 'Erreur', description: 'Impossible d\'envoyer le formulaire.', variant: 'destructive'});
        console.error(error);
      } finally {
        setIsSubmitting(false);
      }
  };

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      {!isCodeVerified ? (
        <NeumorphicCard className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <NeumorphicCard className="rounded-full p-4">
              <Handshake className="w-16 h-16 text-primary" />
            </NeumorphicCard>
          </div>
          <h1 className="text-4xl font-bold font-headline">Devenez Partenaire</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Pour accéder au formulaire de partenariat, veuillez entrer le code d'accès qui vous a été fourni.
          </p>

          <form onSubmit={handleCodeSubmit} className="mt-10 max-w-sm mx-auto space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Entrez votre code partenaire"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark pl-10"
              />
            </div>

            <Button type="submit" size="lg" className="w-full btn-neumorphic-light dark:btn-neumorphic-dark font-bold text-lg">
              Vérifier le code
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </NeumorphicCard>
      ) : (
        <PartnerForm onFormSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}
