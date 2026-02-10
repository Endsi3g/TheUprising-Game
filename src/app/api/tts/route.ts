
import { NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/tts-service';
import { TtsSchema } from '@/lib/validators';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip, 'tts-legacy', { limit: 10, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
    }

    try {
        const body = await req.json();
        const parsed = TtsSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const { text, language } = parsed.data;

        const result = await textToSpeech({
            text,
            language,
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
