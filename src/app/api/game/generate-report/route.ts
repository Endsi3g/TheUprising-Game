import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/llm';

export const maxDuration = 60; // Allow longer timeout for report generation

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mode, niche, language, history, auditHtmlSummary } = body;

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

        return NextResponse.json({ report });
    } catch (error) {
        console.error('[API] Report generation failed:', error);
        return NextResponse.json(
            { error: 'Failed to generate report' },
            { status: 500 }
        );
    }
}
