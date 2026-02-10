import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/llm';
import { createServiceClient } from '@/lib/supabase';

export const maxDuration = 60; // Allow longer timeout for report generation

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode, niche, language, history, auditHtmlSummary, sessionId } = body;

        // Validation
        if (!mode || !niche || !language || !history) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

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
