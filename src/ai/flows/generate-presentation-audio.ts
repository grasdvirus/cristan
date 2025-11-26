
'use server';
/**
 * @fileOverview A Genkit flow to convert a text script into speech audio.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

const AudioInputSchema = z.string().describe('The text script to be converted to speech.');
const AudioOutputSchema = z.object({
  media: z.string().describe("The generated audio data as a Base64-encoded WAV data URI. Format: 'data:audio/wav;base64,<encoded_data>'"),
});

export async function generatePresentationAudio(input: z.infer<typeof AudioInputSchema>): Promise<z.infer<typeof AudioOutputSchema>> {
  return generatePresentationAudioFlow(input);
}

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

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generatePresentationAudioFlow = ai.defineFlow(
  {
    name: 'generatePresentationAudioFlow',
    inputSchema: AudioInputSchema,
    outputSchema: AudioOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'algenib' },
          },
        },
      },
      prompt: query,
    });

    if (!media?.url) {
      throw new Error('No media returned from the TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return {
      media: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
