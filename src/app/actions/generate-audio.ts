'use server';

import { generatePresentationAudio } from '@/ai/flows/generate-presentation-audio';

export async function generateAndPlayAudio(text: string): Promise<Blob> {
  const result = await generatePresentationAudio(text);

  if (!result.media) {
    throw new Error('Aucun média audio retourné.');
  }

  // Décoder la chaîne Base64
  const base64Data = result.media.split(',')[1];
  const audioBuffer = Buffer.from(base64Data, 'base64');

  // Renvoyer les données en tant que Blob
  return new Blob([audioBuffer], { type: 'audio/wav' });
}
