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
import type { PartnerMessage } from '@/app/admin/page';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  content: z.string().min(1, 'Le contenu est requis.'),
});

export type PartnerMessageFormValues = z.infer<typeof formSchema>;

interface PartnerMessageFormProps {
  initialData?: PartnerMessage | null;
  onSubmit: (values: PartnerMessageFormValues) => void;
  isSubmitting: boolean;
}

export function PartnerMessageForm({ initialData, onSubmit, isSubmitting }: PartnerMessageFormProps) {
  const form = useForm<PartnerMessageFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: '',
      content: '',
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
              <FormLabel>Titre du Message</FormLabel>
              <FormControl>
                <Input placeholder="Titre de l'annonce" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu du Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Écrivez votre message ici..." {...field} rows={8} />
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
