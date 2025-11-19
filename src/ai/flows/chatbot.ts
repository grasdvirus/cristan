'use server';
/**
 * @fileOverview A Genkit flow for a simple Q&A chatbot.
 *
 * - chatWithBot - A function that takes a user's query and returns a text response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatbotInputSchema = z.string();
const ChatbotOutputSchema = z.string();

export async function chatWithBot(input: z.infer<typeof ChatbotInputSchema>): Promise<z.infer<typeof ChatbotOutputSchema>> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: { schema: ChatbotInputSchema },
  output: { schema: ChatbotOutputSchema },
  prompt: `Vous êtes un assistant virtuel pour le site "Cristan". Votre rôle est de répondre aux questions des utilisateurs de manière concise, amicale et professionnelle, en français uniquement.

  Informations sur Cristan :
  - Mission : Fournir des solutions web esthétiques et fonctionnelles (sites vitrines, e-commerce, portfolios) avec un design neumorphique.
  - Processus de projet : L'utilisateur choisit un modèle, remplit un formulaire, puis l'équipe Cristan le contacte.
  - Projet sur mesure : Cristan propose aussi des projets créés de A à Z.
  - Partenariat : Les utilisateurs peuvent devenir partenaires en créant un compte et en postulant via un formulaire dédié. Ils obtiennent un code promo et un tableau de bord pour suivre leurs gains. Le code d'accès est CRISTAN-PAT.
  - Paiement : Virement bancaire et paiements mobiles (Orange Money, Wave). Un acompte de 50% est demandé.
  - Contact : 07 04 54 29 09, kingstartup2@gmail.com.

  Répondez à la question suivante de l'utilisateur. Soyez bref et allez droit au but.

  Question de l'utilisateur : {{{prompt}}}
  `,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (query) => {
    const { output } = await prompt(query);
    return output || "Désolé, je n'ai pas pu générer de réponse. Veuillez reformuler votre question.";
  }
);
