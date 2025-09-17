'use server';

/**
 * @fileOverview A flow for converting text to speech.
 * - textToSpeech: A function that takes text and returns a WAV audio data URI.
 * - TextToSpeechInput: The input type for the textToSpeech function.
 * - TextToSpeechOutput: The return type for the textToSpeech function.
 */

import { ai } from 'genkit';
import { z } from 'genkit/zod';
import { googleAI } from '@genkit-ai/googleai';
import * as wav from 'wav';

// Define the input schema for the TTS flow
const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

// Define the output schema for the TTS flow
const TextToSpeechOutputSchema = z.object({
  audioUrl: z.string().describe("The generated audio as a 'data:audio/wav;base64,...' URI."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


/**
 * Converts PCM audio data buffer to a Base64 encoded WAV string.
 */
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}

// Define the main Genkit flow for text-to-speech
const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: input.text,
    });

    if (!media?.url) {
      throw new Error('No audio media returned from the model.');
    }

    // The media URL is a data URI with base64 encoded PCM data
    const pcmData = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(pcmData);
    
    return {
      audioUrl: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);

// Export a wrapper function to be called from server-side components/APIs
export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
    return textToSpeechFlow(input);
}
