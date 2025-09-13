
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface ContactFormProps {
  partnerForm?: boolean;
}

const createContactFormSchema = (isPartnerForm: boolean) => {
  let schema = z.object({
      name: z.string().min(2, {
        message: "Le nom doit comporter au moins 2 caractères.",
      }),
      firstname: z.string(),
      email: z.string().email({
        message: "Veuillez saisir une adresse e-mail valide.",
      }),
      phone: z.string(),
      reason: z.string(),
      message: z.string(),
  });

  if (isPartnerForm) {
      schema = schema.extend({
          firstname: z.string().min(2, { message: "Le prénom doit comporter au moins 2 caractères." }),
          phone: z.string().min(8, { message: "Le numéro de téléphone est trop court."}),
          reason: z.string().min(2, { message: "Veuillez sélectionner un motif."}),
          message: z.string().optional(),
      });
  } else {
      schema = schema.extend({
          message: z.string().min(10, { message: "Le message doit comporter au moins 10 caractères." }),
          firstname: z.string().optional(),
          phone: z.string().optional(),
          reason: z.string().optional(),
      });
  }
  
  return schema;
};


export function ContactForm({ partnerForm = false }: ContactFormProps) {
  const { toast } = useToast()
  
  const formSchema = createContactFormSchema(partnerForm);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      firstname: "",
      email: "",
      phone: "",
      reason: "",
      message: "",
    },
  })

  const { formState } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    
    if (partnerForm) {
        try {
            const response = await fetch('/api/contracts/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to submit contract');
            }
            
            toast({
                title: "Demande envoyée !",
                description: "Merci pour votre intérêt. Nous vous contacterons bientôt.",
            });
            form.reset();

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Erreur lors de l'envoi",
                description: "Impossible d'envoyer votre demande. Veuillez réessayer.",
            });
        }
    } else {
        // Simuler un appel API pour le formulaire de contact standard
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(values);
        toast({
          title: "Message envoyé !",
          description: "Merci de nous avoir contactés. Je vous répondrai sous peu.",
        });
        form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className={partnerForm ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
          <FormField
            control={form.control}
            name={"name"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Votre nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {partnerForm && (
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Votre prénom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

           <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className={partnerForm ? "md:col-span-2" : ""}>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="votre.email@exemple.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {partnerForm && (
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+225 00 00 00 00 00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {partnerForm && (
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif du contrat</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="publicite">Affichage publicitaire</SelectItem>
                      <SelectItem value="creation-site">Création de site</SelectItem>
                      <SelectItem value="affiliation">Affiliation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
       
        {!partnerForm && (
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Parlez-moi de votre projet ou de votre demande..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {partnerForm ? "Envoyer la demande" : "Envoyer le message"}
        </Button>
      </form>
    </Form>
  )
}
