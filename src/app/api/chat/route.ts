import { NextResponse } from 'next/server';
import { chat } from '@/lib/llm';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { ChatRequestSchema } from '@/lib/validators';
import { createServiceClient } from '@/lib/supabase';
import type { SessionMode, Niche } from '@/types/database';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip, 'chat', { limit: 20, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
    }

    try {
        const body = await req.json();

        const parsed = ChatRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { message, history, mode, niche, language, sessionId } = parsed.data;

        // Start chat
        const response = await chat({
            userMessage: message,
            history: history || [],
            mode: mode as SessionMode,
            niche: niche as Niche,
            language,
        });

        // Persist to Supabase if sessionId is provided
        if (sessionId) {
            try {
                const supabase = createServiceClient();
                const fullHistory = [
                    ...(history || []),
                    { role: 'user', content: message, timestamp: new Date().toISOString() },
                    { role: 'assistant', content: response.text, timestamp: new Date().toISOString() }
                ];

                await supabase
                    .from('sessions')
                    .update({ raw_input_json: fullHistory })
                    .eq('id', sessionId);
            } catch (dbError) {
                console.error('[DB] Failed to save chat history:', dbError);
                // We don't block the UI if history fails to save
            }
        }

        return NextResponse.json({
            message: response.text,
            provider: response.provider
        });
    } catch (error: unknown) {
        console.error('[API] Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
