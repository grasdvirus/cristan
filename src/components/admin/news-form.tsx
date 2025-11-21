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
import type { NewsItem } from '@/app/admin/page';
import { ImageUpload } from './image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getYoutubeThumbnailUrl } from '@/lib/utils';
import { useEffect } from 'react';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  mediaType: z.enum(['image', 'video'], { required_error: 'Le type de média est requis.' }),
  mediaUrl: z.string().min(1, "L'URL du média ou l'image est requise."),
  videoUrl: z.string().optional(),
  externalLink: z.string().url('URL invalide').optional().or(z.literal('')),
});

export type NewsFormValues = z.infer<typeof formSchema>;

interface NewsFormProps {
  initialData?: NewsItem | null;
  onSubmit: (values: NewsFormValues) => void;
  isSubmitting: boolean;
}

export function NewsForm({ initialData, onSubmit, isSubmitting }: NewsFormProps) {
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      mediaType: 'image',
      mediaUrl: '',
      videoUrl: '',
      externalLink: '',
    },
  });

  const mediaType = form.watch('mediaType');
  const mediaUrlValue = form.watch('mediaUrl');

  useEffect(() => {
    if (mediaType === 'video') {
        const thumbnailUrl = getYoutubeThumbnailUrl(mediaUrlValue);
        if (thumbnailUrl) {
            form.setValue('mediaUrl', thumbnailUrl, { shouldValidate: true });
        }
    }
  }, [mediaType, mediaUrlValue, form]);

  const handleFormSubmit = (values: NewsFormValues) => {
    let submissionValues = { ...values };
    
    if (values.mediaType === 'video') {
      // The videoUrl should be the original youtube link. The mediaUrl is now the thumbnail.
      // But if the user changed the URL, `mediaUrlValue` is the new video URL.
      const thumbnailUrl = getYoutubeThumbnailUrl(mediaUrlValue);
      if (thumbnailUrl) {
        submissionValues.videoUrl = mediaUrlValue; // The raw youtube URL
        submissionValues.mediaUrl = thumbnailUrl; // The thumbnail URL
      } else {
         // It might be that the initialData already has a valid thumbnail
         submissionValues.videoUrl = values.mediaUrl;
      }
    } else {
        // If it's an image, clear the videoUrl
        submissionValues.videoUrl = '';
    }
    onSubmit(submissionValues);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Titre de l'actualité" {...field} />
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
                <Textarea placeholder="Description de l'actualité" {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormLabel>{mediaType === 'image' ? 'Image' : 'URL de la Vidéo (YouTube)'}</FormLabel>
              <FormControl>
                {mediaType === 'image' ? (
                  <ImageUpload 
                    value={field.value} 
                    onChange={field.onChange} 
                    disabled={isSubmitting}
                  />
                ) : (
                  <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="externalLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lien Externe (Optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com/plus-infos" {...field} />
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
