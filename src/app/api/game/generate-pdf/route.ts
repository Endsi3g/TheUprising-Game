import { NextResponse } from 'next/server';
import type { ReportJson } from '@/types/database';
import { GeneratePdfSchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { buildReportPdf } from '@/lib/pdf-builder';

export async function POST(req: Request) {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 'generate-pdf', RATE_LIMITS.generatePdf)) {
        return rateLimitResponse(60);
    }

    try {
        const payload = await req.json();
        const parsed = GeneratePdfSchema.safeParse(payload);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid report data', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const value = parsed.data;
        const report: ReportJson = ('report' in value ? value.report : value) as ReportJson;
        const title = 'report' in value ? (value.title as string) : undefined;

        const pdfBytes = await buildReportPdf(report, title);


        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', 'attachment; filename=\"uprising-report.pdf\"');

        return new NextResponse(new Uint8Array(pdfBytes), { headers });
    } catch (error) {
        console.error('[API] PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
