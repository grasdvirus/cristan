
'use server';
/**
 * @fileOverview A Genkit flow to generate a long project description from a short one.
 *
 * - generateProjectDescription - A function that handles the description generation.
 * - GenerateProjectDescriptionInput - The input type for the function.
 * - GenerateProjectDescriptionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateProjectDescriptionInputSchema = z.object({
  shortDescription: z.string().describe('A short, concise description of a web or mobile project.'),
});
export type GenerateProjectDescriptionInput = z.infer<typeof GenerateProjectDescriptionInputSchema>;

const GenerateProjectDescriptionOutputSchema = z.object({
  longDescription: z.string().describe('A detailed, well-written long description for the project.'),
});
export type GenerateProjectDescriptionOutput = z.infer<typeof GenerateProjectDescriptionOutputSchema>;

export async function generateProjectDescription(
  input: GenerateProjectDescriptionInput
): Promise<GenerateProjectDescriptionOutput> {
  return generateProjectDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectDescriptionPrompt',
  input: { schema: GenerateProjectDescriptionInputSchema },
  output: { schema: GenerateProjectDescriptionOutputSchema },
  prompt: `Vous êtes un rédacteur marketing professionnel spécialisé dans les projets technologiques. Votre tâche est de développer une courte description de projet en une description longue, détaillée et convaincante, rédigée exclusivement en français.

La description longue doit être engageante, mettre en évidence les fonctionnalités et les avantages potentiels, et être rédigée sur un ton professionnel mais accessible. Développez l'idée de base présentée dans la description courte.

Description Courte : {{{shortDescription}}}

Générez une description longue et détaillée en français basée sur cette information.`,
});

const generateProjectDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProjectDescriptionFlow',
    inputSchema: GenerateProjectDescriptionInputSchema,
    outputSchema: GenerateProjectDescriptionOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
