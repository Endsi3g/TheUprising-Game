import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { textToSpeech, textToSpeechStream } from '@/lib/tts-service';
import type { Language, TenantVoiceConfig } from '@/types/database';

// ─── POST /api/voice/speak ────────────────────────────────────────────────────

/**
 * Converts text to speech using ElevenLabs TTS.
 * Uses the tenant's configured voice if available, otherwise uses the default.
 *
 * Request body (JSON):
 *   - text: string — the text to speak
 *   - sessionId: string — the session UUID
 *   - tenantId: string — the tenant UUID (to fetch voice config)
 *   - language?: 'fr' | 'en' — language hint
 *   - stream?: boolean — if true, returns streaming audio
 *
 * Response:
 *   - stream=false: audio/mpeg binary response
 *   - stream=true: streaming audio/mpeg response
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { text, sessionId, tenantId, language, stream: useStream } = body;

        if (!text || typeof text !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "text" field.' },
                { status: 400 }
            );
        }

        if (text.length > 5000) {
            return NextResponse.json(
                { error: 'Text too long (max 5000 characters).' },
                { status: 400 }
            );
        }

        if (!tenantId || typeof tenantId !== 'string') {
            return NextResponse.json(
                { error: 'Missing or invalid "tenantId" field.' },
                { status: 400 }
            );
        }

        // Fetch tenant voice configuration
        let voiceId: string | undefined;
        let lang: Language = language || 'fr';

        try {
            const supabase = createServiceClient();
            const { data: tenant } = await supabase
                .from('tenants')
                .select('voice_config')
                .eq('id', tenantId)
                .single();

            if (tenant?.voice_config) {
                const voiceConfig = tenant.voice_config as TenantVoiceConfig;
                voiceId = voiceConfig.elevenlabs_voice_id || undefined;
            }
        } catch (err) {
            console.warn('[Voice/Speak] Could not fetch tenant voice config:', err);
            // Continue with default voice
        }

        // If session provides language, use it
        if (sessionId && !language) {
            try {
                const supabase = createServiceClient();
                const { data: session } = await supabase
                    .from('sessions')
                    .select('language')
                    .eq('id', sessionId)
                    .single();

                if (session?.language) {
                    lang = session.language as Language;
                }
            } catch {
                // Continue with default language
            }
        }

        if (useStream) {
            // Streaming response
            const { stream, contentType, error } = await textToSpeechStream({
                text,
                voiceId,
                language: lang,
            });

            if (error || !stream) {
                return NextResponse.json(
                    { error: error || 'Failed to generate speech stream' },
                    { status: 500 }
                );
            }

            return new NextResponse(stream, {
                headers: {
                    'Content-Type': contentType,
                    'Transfer-Encoding': 'chunked',
                    'Cache-Control': 'no-cache',
                },
            });
        } else {
            // Buffered response
            const { audioBuffer, contentType, error } = await textToSpeech({
                text,
                voiceId,
                language: lang,
            });

            if (error || audioBuffer.length === 0) {
                return NextResponse.json(
                    { error: error || 'Failed to generate speech' },
                    { status: 500 }
                );
            }

            const uint8 = new Uint8Array(audioBuffer);
            return new NextResponse(uint8, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Length': audioBuffer.length.toString(),
                    'Cache-Control': 'public, max-age=3600',
                },
            });
        }
    } catch (err) {
        console.error('[Voice/Speak] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
