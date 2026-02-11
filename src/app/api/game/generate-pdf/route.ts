import { NextResponse } from 'next/server';
import type { ReportJson } from '@/types/database';
import { GeneratePdfSchema } from '@/lib/validators';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { buildReportPdf } from '@/lib/pdf-builder';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip, 'generate-pdf', { limit: 10, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
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
        const rawTitle = 'report' in value ? value.title : undefined;
        const title = typeof rawTitle === 'string' ? rawTitle : undefined;

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
