

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { NeumorphicCard } from "./neumorphic-card"
import { useFirebase, useUser } from "@/firebase"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { Loader2, PartyPopper } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Le nom complet doit contenir au moins 2 caractères.",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse e-mail valide.",
  }),
  phone: z.string().min(8, {
    message: "Le numéro de téléphone doit être valide.",
  }),
  companyName: z.string().optional(),
  projectDetails: z.string().min(10, {
    message: "Veuillez fournir plus de détails sur votre projet.",
  }).max(500, {
    message: "La description ne doit pas dépasser 500 caractères."
  }),
  promoCode: z.string().optional(),
})

interface ContractFormProps {
    projectId: string | null;
}

export function ContractForm({ projectId }: ContractFormProps) {
    const { toast } = useToast();
    const { firestore, user } = useFirebase();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            companyName: "",
            projectDetails: "",
            promoCode: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({
                variant: "destructive",
                title: "Erreur de base de données",
                description: "Utilisateur non authentifié.",
            });
            return;
        }
        setIsSubmitting(true);
        try {
            const submissionData = {
                ...values,
                projectId: projectId || "N/A",
                type: 'Projet',
                userId: user.uid,
                status: 'Nouveau',
                createdAt: serverTimestamp()
            };
            await addDoc(collection(firestore, "submissions"), submissionData);
            
            setShowSuccessDialog(true);
            form.reset();
        } catch (error) {
            console.error("Error saving submission: ", error);
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Impossible d'enregistrer votre demande. Veuillez réessayer.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleDialogClose = (isOpen: boolean) => {
        setShowSuccessDialog(isOpen);
        if (!isOpen) {
            router.push('/');
        }
    }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <NeumorphicCard inset className="p-6 sm:rounded-2xl rounded-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Adresse e-mail</FormLabel>
                          <FormControl>
                              <Input placeholder="jean.dupont@email.com" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
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
                          <FormLabel>Numéro de téléphone</FormLabel>
                          <FormControl>
                              <Input placeholder="+33 6 12 34 56 78" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Nom de l'entreprise (Optionnel)</FormLabel>
                          <FormControl>
                              <Input placeholder="Ma Super Entreprise" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
              <div className="mt-6">
                  <FormField
                      control={form.control}
                      name="projectDetails"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Détails de votre projet</FormLabel>
                          <FormControl>
                              <Textarea
                                  placeholder="Décrivez brièvement vos besoins, vos objectifs, et toute autre information pertinente..."
                                  className="resize-y min-h-[120px] neumorphic-card-inset-light dark:neumorphic-card-inset-dark"
                                  {...field}
                              />
                          </FormControl>
                          <FormDescription>
                              Cela nous aidera à mieux comprendre votre vision.
                          </FormDescription>
                          <FormMessage />
                          </FormItem>
                      )}
                      />
              </div>
              <div className="mt-6">
                  <FormField
                      control={form.control}
                      name="promoCode"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Code Promo (Optionnel)</FormLabel>
                          <FormControl>
                              <Input placeholder="Vous avez un code promo ?" {...field} className="neumorphic-card-inset-light dark:neumorphic-card-inset-dark" />
                          </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
          </NeumorphicCard>

          <div className="flex justify-end px-4 sm:px-0">
              <Button type="submit" size="lg" className="w-full sm:w-auto btn-neumorphic-light dark:btn-neumorphic-dark" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Envoi...' : 'Soumettre la demande'}
              </Button>
          </div>
        </form>
      </Form>
      
      <Dialog open={showSuccessDialog} onOpenChange={handleDialogClose}>
          <DialogContent className="max-w-sm bg-transparent border-none shadow-none">
              <NeumorphicCard className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-300/20 via-blue-300/20 to-purple-300/20 animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute inset-0 sparkle-mask"></div>
                  
                  <div className="relative flex flex-col items-center text-center py-8 px-4">
                      <DialogHeader>
                          <DialogTitle className="text-center text-2xl font-bold font-headline">Demande envoyée !</DialogTitle>
                      </DialogHeader>
                      <div className="text-7xl my-6 animate-bounce">
                          <PartyPopper className="h-20 w-20 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                          Nous avons bien reçu vos informations et vous recontacterons bientôt.
                      </p>
                      <Button 
                          onClick={() => handleDialogClose(false)} 
                          className="mt-8 btn-neumorphic-light dark:btn-neumorphic-dark"
                      >
                          Fermer
                      </Button>
                  </div>
              </NeumorphicCard>
          </DialogContent>
      </Dialog>
    </>
  )
}
