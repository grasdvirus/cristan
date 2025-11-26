'use server';

import { generatePresentationAudio } from '@/ai/flows/generate-presentation-audio';

export async function generateAudioAction(text: string): Promise<{ audioBase64: string } | { error: string }> {
  try {
    const result = await generatePresentationAudio(text);

    if (!result.media) {
      return { error: 'Aucun média audio retourné.' };
    }

    // Renvoyer uniquement la partie Base64 de la data URI
    const base64Data = result.media.split(',')[1];
    
    return { audioBase64: base64Data };
  } catch (error: any) {
    console.error("Erreur dans generateAudioAction:", error);
    return { error: error.message || "Une erreur est survenue lors de la génération de l'audio." };
  }
}
