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
import type { Video } from '@/app/admin/page';
import { ImageUpload } from './image-upload';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  uploadDate: z.string().optional(),
  views: z.string().optional(),
  videoUrl: z.string().url('URL invalide'),
  thumbnailUrl: z.string().min(1, "L'URL de la miniature est requise."),
  thumbnailHint: z.string().optional(),
});

export type VideoFormValues = z.infer<typeof formSchema>;

interface VideoFormProps {
  initialData?: Video | null;
  onSubmit: (values: VideoFormValues) => void;
  isSubmitting: boolean;
}

export function VideoForm({ initialData, onSubmit, isSubmitting }: VideoFormProps) {
  const form = useForm<VideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      uploadDate: '',
      views: '',
      videoUrl: '',
      thumbnailUrl: '',
      thumbnailHint: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField
          control={form.control}
          name="thumbnailUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Miniature de la vidéo</FormLabel>
              <FormControl>
                <ImageUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la vidéo" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description de la vidéo" {...field} rows={5}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="uploadDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de publication (Optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="ex: 12 mai 2024" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="views"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vues (Optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="ex: 12k vues" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="videoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de la vidéo (YouTube)</FormLabel>
              <FormControl>
                <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnailHint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indice pour la miniature (IA)</FormLabel>
              <FormControl>
                <Input placeholder="ex: tech talk" {...field} />
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
