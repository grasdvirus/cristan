'use server';

/**
 * @fileOverview An AI-powered theme switching flow that suggests a light or dark theme based on user preferences or time of day.
 *
 * - intelligentThemeSwitching - A function that determines the best theme (light or dark) based on provided context.
 * - IntelligentThemeSwitchingInput - The input type for the intelligentThemeSwitching function.
 * - IntelligentThemeSwitchingOutput - The return type for the intelligentThemeSwitching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentThemeSwitchingInputSchema = z.object({
  userPreferences: z
    .string()
    .optional()
    .describe(
      'Optional: User preferences regarding light or dark themes.  If not provided, the timeOfDay should be provided.'
    ),
  timeOfDay: z
    .string()
    .optional()
    .describe(
      'Optional: Time of day (e.g., morning, afternoon, evening, night). If not provided, the userPreferences should be provided.'
    ),
});
export type IntelligentThemeSwitchingInput = z.infer<
  typeof IntelligentThemeSwitchingInputSchema
>;

const IntelligentThemeSwitchingOutputSchema = z.object({
  theme: z.enum(['light', 'dark']).describe('The recommended theme (light or dark).'),
  reason: z.string().describe('The reason for the theme recommendation.'),
});
export type IntelligentThemeSwitchingOutput = z.infer<
  typeof IntelligentThemeSwitchingOutputSchema
>;

export async function intelligentThemeSwitching(
  input: IntelligentThemeSwitchingInput
): Promise<IntelligentThemeSwitchingOutput> {
  return intelligentThemeSwitchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentThemeSwitchingPrompt',
  input: {schema: IntelligentThemeSwitchingInputSchema},
  output: {schema: IntelligentThemeSwitchingOutputSchema},
  prompt: `You are a theme recommendation AI. Based on the user's preferences or the time of day, you will recommend either a \"light\" or \"dark\" theme for their website.

  The website uses a neumorphism style with primary color light grey (#E0E5EC), background color very light grey (#F0F0F0), and accent color dark grey (#333333).

  If the time of day is provided, recommend \"light\" during the day (morning, afternoon) and \"dark\" during the night (evening, night).

  If the user's preferences are provided, use them to determine the best theme.  If the preferences indicate a preference for dark themes, select \"dark\". Otherwise, select \"light\".

  User Preferences: {{{userPreferences}}}
  Time of Day: {{{timeOfDay}}}

  Respond using JSON format.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const intelligentThemeSwitchingFlow = ai.defineFlow(
  {
    name: 'intelligentThemeSwitchingFlow',
    inputSchema: IntelligentThemeSwitchingInputSchema,
    outputSchema: IntelligentThemeSwitchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
