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
import type { MarqueeItem } from '@/app/admin/page';

const formSchema = z.object({
  text: z.string().min(1, 'Le texte est requis.'),
});

export type MarqueeFormValues = z.infer<typeof formSchema>;

interface MarqueeFormProps {
  initialData?: MarqueeItem | null;
  onSubmit: (values: MarqueeFormValues) => void;
  isSubmitting: boolean;
}

export function MarqueeForm({ initialData, onSubmit, isSubmitting }: MarqueeFormProps) {
  const form = useForm<MarqueeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { text: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texte du message</FormLabel>
              <FormControl>
                <Input placeholder="Votre message ici..." {...field} />
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
