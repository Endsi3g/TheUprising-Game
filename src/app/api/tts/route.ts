
import { NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/tts-service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { text, language } = body;

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const result = await textToSpeech({
            text,
            language: language || 'fr'
        });

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Return audio buffer
        return new NextResponse(new Uint8Array(result.audioBuffer), {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': result.audioBuffer.length.toString(),
            },
        });
    } catch (error: unknown) {
        console.error('[API] TTS error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
