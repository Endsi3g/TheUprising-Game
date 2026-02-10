import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/tts-service';
import { rateLimitGuard } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    // ── Rate limiting (10 req/min per IP) ────────────────────────────────
    const limited = rateLimitGuard(req, { prefix: 'tts', max: 10 });
    if (limited) return limited;

    try {
        const body = await req.json();
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

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[TTS API] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
