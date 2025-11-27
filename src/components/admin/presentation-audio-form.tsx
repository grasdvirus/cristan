
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
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  text: z.string().min(1, 'Le texte est requis.'),
});

export type PresentationAudioFormValues = z.infer<typeof formSchema>;

interface PresentationAudioFormProps {
  initialData?: { title: string; text: string } | null;
  onSubmit: (values: PresentationAudioFormValues) => void;
  isSubmitting: boolean;
}

export function PresentationAudioForm({ initialData, onSubmit, isSubmitting }: PresentationAudioFormProps) {
  const form = useForm<PresentationAudioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      text: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre du Script</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Présentation de la page d'accueil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu du Script</FormLabel>
              <FormControl>
                <Textarea placeholder="Écrivez le script de la voix off ici..." {...field} rows={10} />
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
