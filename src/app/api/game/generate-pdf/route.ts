import { NextResponse } from 'next/server';
import { generatePdf } from '@/lib/pdf';
import type { ReportJson } from '@/types/database';

/**
 * API route to generate a PDF from a report JSON.
 * POST /api/game/generate-pdf
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { report } = body;

        if (!report) {
            return NextResponse.json({ error: 'Report data is required' }, { status: 400 });
        }

        const pdfBuffer = await generatePdf(report as ReportJson);

        // Return PDF as downloadable attachment
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="rapport-${report.mode}-${new Date().toISOString().split('T')[0]}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (error: unknown) {
        console.error('[API] PDF generation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
