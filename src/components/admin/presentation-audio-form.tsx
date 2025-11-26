
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
      text: 'Bienvenue sur Cristan. Découvrez nos solutions web uniques et innovantes.',
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
