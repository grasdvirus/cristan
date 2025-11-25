
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
import { MediaUpload } from './media-upload';
import type { PromoVideo } from '@/app/admin/page';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  videoUrl: z.string().min(1, 'Une vidéo est requise.'),
});

export type PromoVideoFormValues = z.infer<typeof formSchema>;

interface PromoVideoFormProps {
  initialData?: PromoVideo | null;
  onSubmit: (values: PromoVideoFormValues) => void;
  isSubmitting: boolean;
}

export function PromoVideoForm({ initialData, onSubmit, isSubmitting }: PromoVideoFormProps) {
  const form = useForm<PromoVideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      videoUrl: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de la vidéo</FormLabel>
              <FormControl>
                <Input placeholder="Vidéo promotionnelle..." {...field} />
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
              <FormLabel>Fichier Vidéo</FormLabel>
              <FormControl>
                <MediaUpload 
                  value={field.value} 
                  onChange={field.onChange} 
                  disabled={isSubmitting}
                  accept={{ 'video/*': [] }}
                  mediaType="video"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder la vidéo'}
        </Button>
      </form>
    </Form>
  );
}
