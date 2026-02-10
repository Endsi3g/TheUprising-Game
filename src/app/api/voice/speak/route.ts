import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/tts-service';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log('[TTS API] Received body:', body);
        const { text, voiceId } = body;

        if (!text) {
            return NextResponse.json({ error: 'Missing text' }, { status: 400 });
        }

        const result = await textToSpeech({
            text,
            voiceId,
            language: 'fr', // Force French
        });

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }

        // Convert Buffer to Uint8Array for NextResponse compatibility
        return new NextResponse(new Uint8Array(result.audioBuffer), {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': result.audioBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('TTS API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
