
"use client"

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
import { useToast } from "@/hooks/use-toast"
import { NeumorphicCard } from "./neumorphic-card"

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
})

export function ContractForm() {
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            companyName: "",
            projectDetails: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        toast({
          title: "Formulaire envoyé !",
          description: "Merci ! Nous avons bien reçu vos informations et nous vous contacterons bientôt.",
        })
        form.reset();
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <NeumorphicCard inset className="p-6">
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
        </NeumorphicCard>

        <div className="flex justify-end">
            <Button type="submit" size="lg" className="btn-neumorphic-light dark:btn-neumorphic-dark">
                Soumettre la demande
            </Button>
        </div>
      </form>
    </Form>
  )
}
