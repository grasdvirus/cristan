'use server';
/**
 * @fileOverview A Genkit flow for a simple Q&A chatbot with history.
 *
 * - chatWithBot - A function that takes a user's query and conversation history, and returns a text response.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.array(z.object({ text: z.string() })),
});

const ChatbotInputSchema = z.object({
  history: z.array(MessageSchema),
  message: z.string(),
});

const ChatbotOutputSchema = z.string();

export async function chatWithBot(input: z.infer<typeof ChatbotInputSchema>): Promise<z.infer<typeof ChatbotOutputSchema>> {
  return chatbotFlow(input);
}

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async ({ history, message }) => {
    
    // The history and the new message are passed to ai.generate
    const response = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      history: history,
      prompt: message,
      system: `Vous êtes un assistant virtuel pour le site "Cristan". Votre rôle est de répondre aux questions des utilisateurs de manière concise, amicale et professionnelle, en français uniquement.

      Informations sur Cristan :
      - Mission : Fournir des solutions web esthétiques et fonctionnelles (sites vitrines, e-commerce, portfolios) avec un design neumorphique.
      - Processus de projet : L'utilisateur choisit un modèle, remplit un formulaire, puis l'équipe Cristan le contacte.
      - Projet sur mesure : Cristan propose aussi des projets créés de A à Z.
      - Partenariat : Les utilisateurs peuvent devenir partenaires en créant un compte et en postulant via un formulaire dédié avec le code d'accès "CRISTAN-PAT". Ils obtiennent un code promo et un tableau de bord pour suivre leurs gains.
      - Paiement : Virement bancaire et paiements mobiles (Orange Money, Wave). Un acompte de 50% est demandé.
      - Contact : 07 04 54 29 09, kingstartup2@gmail.com.
      
      Répondez à la question de l'utilisateur. Soyez bref et allez droit au but.
      `,
    });
    
    return response.text || "Désolé, je n'ai pas pu générer de réponse. Veuillez reformuler votre question.";
  }
);
