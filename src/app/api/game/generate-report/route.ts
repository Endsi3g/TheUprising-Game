import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/llm';
import { createServiceClient } from '@/lib/supabase';
import { GenerateReportSchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { logReportGenerated, logSessionComplete } from '@/lib/logger';

export const maxDuration = 60; // Allow longer timeout for report generation

export async function POST(req: NextRequest) {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 'generate-report', RATE_LIMITS.generateReport)) {
        return rateLimitResponse(60);
    }

    try {
        const body = await req.json();
        const parsed = GenerateReportSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { mode, niche, language, history, auditHtmlSummary, sessionId } = parsed.data;
        const reportStart = Date.now();
        const completedAt = new Date().toISOString();

        const report = await generateReport({
            mode,
            niche,
            language,
            conversation: history,
            auditHtmlSummary
        });

        // Persist report to Supabase if sessionId is provided
        if (sessionId) {
            try {
                const supabase = createServiceClient();
                await supabase
                    .from('sessions')
                    .update({
                        report_json: report,
                        completed_at: completedAt
                    })
                    .eq('id', sessionId);

                const { data: sessionMeta } = await supabase
                    .from('sessions')
                    .select('tenant_id, created_at')
                    .eq('id', sessionId)
                    .single();

                if (sessionMeta) {
                    const durationMs = Date.now() - new Date(sessionMeta.created_at).getTime();
                    const score = typeof report.gamification?.score === 'number' ? report.gamification.score : 0;
                    void logSessionComplete(sessionMeta.tenant_id, sessionId, durationMs);
                    void logReportGenerated(sessionMeta.tenant_id, sessionId, Date.now() - reportStart, score);
                }

                // Check for lead and send email
                const { data: lead } = await supabase
                    .from('leads')
                    .select('email, first_name')
                    .eq('session_id', sessionId)
                    .single();

                if (lead && lead.email) {
                    // Import dynamically or assume imported at top
                    // We need to import sendReportEmail at the top
                    await import('@/lib/email').then(({ sendReportEmail }) =>
                        sendReportEmail({
                            to: lead.email,
                            firstName: lead.first_name,
                            report,
                            sessionId
                        })
                    );
                }
            } catch (dbError) {
                console.error('[DB/Email] Failed to save report or send email:', dbError);
            }
        }

        return NextResponse.json({ report });
    } catch (error: unknown) {
        console.error('[API] Report generation failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate report';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
