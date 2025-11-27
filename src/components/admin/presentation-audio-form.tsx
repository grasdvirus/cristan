
'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { PresentationAudio } from '@/app/admin/page';

const formSchema = z.object({
  text: z.string().min(1, 'Le texte est requis.'),
});

export type PresentationAudioFormValues = z.infer<typeof formSchema>;

interface PresentationAudioFormProps {
  initialData?: PresentationAudio | null;
  onSubmit: (values: PresentationAudioFormValues) => void;
  isSubmitting: boolean;
}

export function PresentationAudioForm({ initialData, onSubmit, isSubmitting }: PresentationAudioFormProps) {
  const form = useForm<PresentationAudioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      text: 'Bienvenue sur Cristan !\n\nVous cherchez un site web au design unique et mémorable ? Nous créons des sites vitrines, des boutiques en ligne et des portfolios qui se démarquent.\n\nLe processus est simple : choisissez un modèle qui vous inspire, remplissez le formulaire de commande, et notre équipe vous contacte en quelques minutes pour donner vie à votre projet.\n\nAlors, prêt à lancer votre présence en ligne ? Cristan, le design au service de votre vision.',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Script de la présentation</FormLabel>
              <FormControl>
                <Textarea placeholder="Écrivez le script ici..." {...field} rows={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder le script'}
        </Button>
      </form>
    </Form>
  );
}
