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
  mediaUrl: z.string().min(1, "L'image ou la miniature est requise."),
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
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
              <FormLabel>{mediaType === 'video' ? 'Miniature de la vidéo' : 'Fichier Image'}</FormLabel>
              <FormControl>
                <MediaUpload 
                  value={field.value || ''}
                  onChange={field.onChange} 
                  disabled={isSubmitting}
                  mediaType={'image'} // This uploader always handles images
                  accept={{ 'image/*': [] }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {mediaType === 'video' && (
             <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fichier Vidéo</FormLabel>
                  <FormControl>
                    <MediaUpload 
                      value={field.value || ''}
                      onChange={field.onChange} 
                      disabled={isSubmitting}
                      mediaType={'video'}
                      accept={{ 'video/*': [] }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}

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
                  <Input placeholder="ex: abstract architecture" {...field} value={field.value || ''} />
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
