
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Slide } from '@/app/admin/page';

const formSchema = z.object({
  description: z.string().min(1, 'La description est requise.'),
  imageUrl: z.string().url('Veuillez entrer une URL valide.'),
  imageHint: z.string().optional(),
});

type SlideFormValues = z.infer<typeof formSchema>;

interface SlideFormProps {
  initialData?: Slide | null;
  onSubmit: (values: SlideFormValues) => void;
  isSubmitting: boolean;
}

export function SlideForm({ initialData, onSubmit, isSubmitting }: SlideFormProps) {
  const form = useForm<SlideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { description: '', imageUrl: '', imageHint: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Texte affiché sur le slide" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="imageHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indice pour l'image (IA)</FormLabel>
              <FormControl>
                <Input placeholder="ex: abstract architecture" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </form>
    </Form>
  );
}
