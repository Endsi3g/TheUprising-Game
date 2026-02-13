import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/tts-service';
import { checkRateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIp(req);
        if (!checkRateLimit(ip, 'tts', { limit: 10, windowMs: 60 * 1000 })) {
            return rateLimitResponse(60);
        }

        const body = await req.json();
        const { text, voiceId } = body;
        console.log('[TTS API] Request received for voiceId:', voiceId, 'Text length:', text?.length);

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

    } catch (error: unknown) {
        console.error('TTS API Error:', error);
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
