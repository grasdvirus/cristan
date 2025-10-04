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
  prompt: `You are a professional marketing copywriter specializing in technology projects. Your task is to expand a short project description into a detailed and compelling long description.

The long description should be engaging, highlight potential features and benefits, and be written in a professional yet accessible tone. Elaborate on the core idea presented in the short description.

Short Description: {{{shortDescription}}}

Generate a detailed long description based on this.`,
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
