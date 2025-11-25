
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
import type { PartnerMarqueeItem } from '@/app/admin/page';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.'),
  emoji: z.string().min(1, 'Un émoji est requis.'),
});

export type PartnerMarqueeFormValues = z.infer<typeof formSchema>;

interface PartnerMarqueeFormProps {
  initialData?: PartnerMarqueeItem | null;
  onSubmit: (values: PartnerMarqueeFormValues) => void;
  isSubmitting: boolean;
}

export function PartnerMarqueeForm({ initialData, onSubmit, isSubmitting }: PartnerMarqueeFormProps) {
  const form = useForm<PartnerMarqueeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', emoji: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du partenaire</FormLabel>
              <FormControl>
                <Input placeholder="Nom du partenaire" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="emoji"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Émoji</FormLabel>
              <FormControl>
                <Input placeholder="✨" {...field} maxLength={2} />
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
