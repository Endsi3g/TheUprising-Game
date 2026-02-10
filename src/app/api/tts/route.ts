
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
    } catch (error: any) {
        console.error('[API] TTS error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
