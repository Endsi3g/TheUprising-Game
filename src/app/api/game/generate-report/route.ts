import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/llm';
import { createServiceClient } from '@/lib/supabase';
import { GenerateReportSchema } from '@/lib/validators';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export const maxDuration = 60; // Allow longer timeout for report generation

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip, 'generate-report', { limit: 5, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
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
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', sessionId);
            } catch (dbError) {
                console.error('[DB] Failed to save final report:', dbError);
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
