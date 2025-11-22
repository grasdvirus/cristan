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
import type { AvisClient } from '@/app/admin/page';
import { MediaUpload } from './media-upload';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  message: z.string().min(1, 'Le message est requis.'),
  rating: z.number().min(1).max(5),
  avatarUrl: z.string().optional(),
});

export type AvisClientFormValues = z.infer<typeof formSchema>;

interface AvisClientFormProps {
  initialData?: AvisClient | null;
  onSubmit: (values: AvisClientFormValues) => void;
  isSubmitting: boolean;
}

export function AvisClientForm({ initialData, onSubmit, isSubmitting }: AvisClientFormProps) {
  const form = useForm<AvisClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      message: '',
      rating: 5,
      avatarUrl: '',
    },
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const currentRating = form.watch('rating');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar (Optionnel)</FormLabel>
              <FormControl>
                <MediaUpload 
                  value={field.value || ''} 
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du client</FormLabel>
              <FormControl>
                <Input placeholder="Jean Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message du client</FormLabel>
              <FormControl>
                <Textarea placeholder="Leur service était incroyable..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-6 w-6 cursor-pointer transition-colors",
                        (hoveredRating >= star || (!hoveredRating && currentRating >= star)) 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-muted-foreground/50"
                      )}
                      onMouseEnter={() => setHoveredRating(star)}
                      onClick={() => form.setValue('rating', star)}
                    />
                  ))}
                </div>
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
