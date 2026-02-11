import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { SendMessageSchema } from '@/lib/validators';
import { chat } from '@/lib/llm';
import type { ConversationMessage, Language } from '@/types/database';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, 'session-message', RATE_LIMITS.sessionMessage)) {
        return rateLimitResponse(60);
    }

    try {
        const { id: sessionId } = await params;
        const body = await request.json();

        // Extract optional voice fields before Zod validation
        const voiceTranscript = body.voiceTranscript as string | undefined;
        const languageOverride = body.languageOverride as Language | undefined;
        const imageDataUrl = body.imageDataUrl as string | undefined;

        const parsed = SendMessageSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        // Use voice transcript if provided, otherwise use typed message
        const userMessage = voiceTranscript || parsed.data.message;
        const supabase = createServiceClient();

        // Fetch session
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

        if (sessionError || !session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        if (session.completed_at) {
            return NextResponse.json(
                { error: 'Session already completed' },
                { status: 400 }
            );
        }

        // Handle language override (from voice auto-detection)
        const sessionLanguage: Language = languageOverride || session.language;

        if (languageOverride && languageOverride !== session.language) {
            // Update session language in Supabase
            await supabase
                .from('sessions')
                .update({ language: languageOverride })
                .eq('id', sessionId);

            console.log(`[Session/Message] Language switched: ${session.language} → ${languageOverride}`);
        }

        // Get conversation history
        const history: ConversationMessage[] = session.raw_input_json || [];

        // Optionally fetch audit HTML summary for audit mode
        let auditHtmlSummary: string | undefined;
        if (session.mode === 'audit') {
            const { data: auditRun } = await supabase
                .from('audit_runs')
                .select('html_summary')
                .eq('session_id', sessionId)
                .eq('status', 'done')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (auditRun?.html_summary) {
                auditHtmlSummary = auditRun.html_summary;
            }
        }

        // Call LLM with potentially updated language
        const llmResponse = await chat({
            mode: session.mode,
            niche: session.niche,
            language: sessionLanguage,
            history,
            userMessage,
            auditHtmlSummary,
            imageDataUrl,
        });

        // Update conversation history
        const now = new Date().toISOString();
        const updatedHistory: ConversationMessage[] = [
            ...history,
            {
                role: 'user',
                content: userMessage,
                timestamp: now,
            },
            {
                role: 'assistant',
                content: llmResponse.text,
                timestamp: now,
            },
        ];

        const { error: updateError } = await supabase
            .from('sessions')
            .update({ raw_input_json: updatedHistory })
            .eq('id', sessionId);

        if (updateError) {
            console.error('[Session/Message] Update error:', updateError);
        }

        // Determine if ready for report
        const readyForReport = llmResponse.text.includes('[READY_FOR_REPORT]');

        return NextResponse.json({
            reply: llmResponse.text.replace('[READY_FOR_REPORT]', '').trim(),
            provider: llmResponse.provider,
            readyForReport,
            messageCount: updatedHistory.length,
            language: sessionLanguage,
            isVoiceInput: !!voiceTranscript,
        });
    } catch (err) {
        console.error('[Session/Message] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

