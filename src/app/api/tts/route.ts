
import { textToSpeech } from '@/ai/flows/tts-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    const { audioUrl } = await textToSpeech({ text });
    
    return NextResponse.json({ audioDataUri: audioUrl });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}
