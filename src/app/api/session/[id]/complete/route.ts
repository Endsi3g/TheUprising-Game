import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generateReport } from '@/lib/llm';
import { computeGamification } from '@/lib/gamification';
import { getMatchingUpsells } from '@/lib/b2b-report';
import { logSessionComplete, logReportGenerated, logBadgeUnlocked } from '@/lib/logger';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, 'session-complete', RATE_LIMITS.sessionComplete)) {
        return rateLimitResponse(60);
    }

    try {
        const { id: sessionId } = await params;
        const supabase = createServiceClient();
        const startTime = Date.now();

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
                { error: 'Session already completed', report: session.report_json },
                { status: 400 }
            );
        }

        // Fetch tenant for voice config + upsells
        const { data: tenant } = await supabase
            .from('tenants')
            .select('voice_config, upsell_packs')
            .eq('id', session.tenant_id)
            .single();

        // Optionally fetch audit HTML summary
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

        // Generate structured report via LLM
        const report = await generateReport({
            mode: session.mode,
            niche: session.niche,
            language: session.language,
            conversation: session.raw_input_json || [],
            auditHtmlSummary,
        });

        // Compute gamification
        const gamification = computeGamification(report, auditHtmlSummary);
        report.gamification = gamification;

        // Match upsells based on score and problems
        const problems = gamification.badges
            .filter((b) => !b.earned)
            .map((b) => b.type);
        const upsells = getMatchingUpsells(
            gamification.score,
            problems,
            tenant?.upsell_packs || undefined
        );
        report.upsells = upsells;

        // Calculate session duration
        const sessionCreated = new Date(session.created_at).getTime();
        const durationMs = Date.now() - sessionCreated;

        // Update session with report + gamification
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('sessions')
            .update({
                report_json: report,
                gamification_json: gamification,
                duration_ms: durationMs,
                completed_at: now,
            })
            .eq('id', sessionId);

        if (updateError) {
            console.error('[Session/Complete] Update error:', updateError);
            return NextResponse.json(
                { error: 'Failed to save report' },
                { status: 500 }
            );
        }

        // Log events (non-blocking)
        const reportDuration = Date.now() - startTime;
        logSessionComplete(session.tenant_id, sessionId, durationMs);
        logReportGenerated(session.tenant_id, sessionId, reportDuration, gamification.score);

        // Log earned badges
        gamification.badges
            .filter((b) => b.earned)
            .forEach((b) => logBadgeUnlocked(session.tenant_id, sessionId, b.type));

        // Build response URLs
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        return NextResponse.json({
            report,
            gamification,
            upsells,
            pdfUrl: `${appUrl}/api/report/${sessionId}/pdf`,
            qrUrl: `${appUrl}/m/session/${sessionId}`,
            completedAt: now,
            durationMs,
        });
    } catch (err) {
        console.error('[Session/Complete] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
