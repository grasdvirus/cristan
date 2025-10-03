
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
import type { Project } from '@/app/admin/page';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  longDescription: z.string().min(1, 'La description longue est requise.'),
  price: z.string().min(1, 'Le prix est requis.'),
  technologies: z.string().min(1, 'Les technologies sont requises.'),
  liveUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  imageUrl: z.string().url('URL d\'image invalide.'),
  imageHint: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  initialData?: Project | null;
  onSubmit: (values: ProjectFormValues) => void;
  isSubmitting: boolean;
}

export function ProjectForm({ initialData, onSubmit, isSubmitting }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        ...initialData,
        technologies: initialData?.technologies?.join(', ') || '',
    } || {
      title: '',
      description: '',
      longDescription: '',
      price: '',
      technologies: '',
      liveUrl: '',
      imageUrl: '',
      imageHint: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Nom du projet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description Courte</FormLabel>
              <FormControl>
                <Textarea placeholder="Description pour la carte du projet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description Longue</FormLabel>
              <FormControl>
                <Textarea placeholder="Description pour la page détaillée du projet" {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix</FormLabel>
              <FormControl>
                <Input placeholder="ex: 1500€" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="technologies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technologies</FormLabel>
              <FormControl>
                <Input placeholder="React, Next.js, Firebase..." {...field} />
              </FormControl>
               <p className="text-xs text-muted-foreground">Séparer les technologies par une virgule.</p>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="liveUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL du site en ligne</FormLabel>
              <FormControl>
                <Input placeholder="https://projet-en-ligne.com" {...field} />
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
                <Input placeholder="ex: modern design" {...field} />
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
