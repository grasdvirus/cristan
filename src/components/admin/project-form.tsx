'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormReturn } from 'react-hook-form';
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
import { MediaUpload } from './media-upload';
import { generateProjectDescription } from '@/ai/flows/generate-project-description';
import { Sparkles, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  title: z.string().min(1, 'Le titre est requis.'),
  description: z.string().min(1, 'La description est requise.'),
  longDescription: z.string().min(1, 'La description longue est requise.'),
  price: z.string().min(1, 'Le prix est requis.'),
  technologies: z.string().min(1, 'Les technologies sont requises.'),
  liveUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  imageUrl: z.string().min(1, "L'URL de l'image est requise."),
  imageHint: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  initialData?: Project | null;
  onSubmit: (values: ProjectFormValues) => void;
  isSubmitting: boolean;
}

function AiDescriptionGenerator({ form }: { form: UseFormReturn<ProjectFormValues> }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        const shortDescription = form.getValues('description');
        if (!shortDescription) {
            toast({
                title: 'Description courte manquante',
                description: "Veuillez d'abord remplir la description courte.",
                variant: 'warning'
            });
            return;
        }

        setIsGenerating(true);
        try {
            const result = await generateProjectDescription({ shortDescription });
            form.setValue('longDescription', result.longDescription, { shouldValidate: true });
            toast({ variant: 'success', title: 'Description longue générée !' });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erreur de l'IA",
                description: "Impossible de générer la description.",
                variant: 'destructive'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            <FormLabel>Description Longue</FormLabel>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-neumorphic-light dark:btn-neumorphic-dark"
            >
                {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Générer avec l'IA
            </Button>
        </div>
    );
}

export function ProjectForm({ initialData, onSubmit, isSubmitting }: ProjectFormProps) {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        technologies: initialData.technologies?.join(', ') || '',
        liveUrl: initialData.liveUrl || '',
        price: initialData.price.replace(' FCFA', ''),
    } : {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image du Projet</FormLabel>
              <FormControl>
                <MediaUpload 
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
              <AiDescriptionGenerator form={form} />
              <FormControl>
                <Textarea placeholder="Générez ou écrivez la description pour la page détaillée du projet" {...field} rows={5} />
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
              <FormLabel>Prix (en FCFA)</FormLabel>
              <FormControl>
                <Input placeholder="ex: 50000" {...field} type="number" />
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
