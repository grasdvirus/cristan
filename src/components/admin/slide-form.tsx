
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
import { MediaUpload } from './media-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const formSchema = z.object({
  description: z.string().min(1, 'La description est requise.'),
  mediaUrl: z.string().min(1, "Le média est requis."),
  imageHint: z.string().optional(),
  mediaType: z.enum(['image', 'video']).default('image'),
  videoUrl: z.string().optional(),
});

export type SlideFormValues = z.infer<typeof formSchema>;

interface SlideFormProps {
  initialData?: Slide | null;
  onSubmit: (values: SlideFormValues) => void;
  isSubmitting: boolean;
}

export function SlideForm({ initialData, onSubmit, isSubmitting }: SlideFormProps) {
  const form = useForm<SlideFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { description: '', mediaUrl: '', imageHint: '', mediaType: 'image', videoUrl: '' },
  });

  const mediaType = form.watch('mediaType');

  const handleFormSubmit = (values: SlideFormValues) => {
    let finalValues = { ...values };

    if (values.mediaType === 'video') {
      // For video slides, mediaUrl from the uploader IS the videoUrl.
      // We set mediaUrl to be the same, so it can be used as a poster if needed.
      finalValues.videoUrl = values.mediaUrl;
    } else {
      // For image slides, mediaUrl is the image file, and videoUrl should be empty.
      finalValues.videoUrl = '';
    }
    onSubmit(finalValues);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
         <FormField
          control={form.control}
          name="mediaType"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Type de Média</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Choisir un type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Vidéo</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mediaUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{mediaType === 'video' ? 'Fichier Vidéo' : 'Fichier Image'}</FormLabel>
              <FormControl>
                <MediaUpload 
                  value={field.value || ''}
                  onChange={field.onChange} 
                  disabled={isSubmitting}
                  mediaType={mediaType}
                  accept={mediaType === 'video' ? { 'video/*': [] } : { 'image/*': [] }}
                />
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
                <Textarea placeholder="Texte affiché sur le slide" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {mediaType === 'image' && (
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
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </form>
    </Form>
  );
}
