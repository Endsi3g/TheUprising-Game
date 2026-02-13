import { NextResponse } from 'next/server';
import type { ReportJson } from '@/types/database';
import { GeneratePdfSchema } from '@/lib/validators';
<<<<<<< HEAD
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { buildReportPdf } from '@/lib/pdf-builder';
=======
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
>>>>>>> origin/master

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
<<<<<<< HEAD
        const report: ReportJson = ('report' in value ? value.report : value) as ReportJson;
        const rawTitle = 'report' in value ? value.title : undefined;
        const title = typeof rawTitle === 'string' ? rawTitle : undefined;
=======
        const report = ('report' in value ? value.report : value) as ReportJson;
        const title = 'report' in value ? value.title : undefined;
>>>>>>> origin/master

        const pdfBytes = await buildReportPdf(report, title);

<<<<<<< HEAD
=======
        doc.on('data', (chunk) => chunks.push(chunk));

        // Wait for the PDF to be fully generated
        const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // --- PDF CONTENT START ---

            // Header Content
            doc.fillColor('#111827')
                .fontSize(24)
                .font('Helvetica-Bold')
                .text((title || "RAPPORT D'ANALYSE - THE UPRISING") as string, { align: 'center' });

            doc.moveDown(0.5);
            doc.fontSize(12)
                .font('Helvetica')
                .fillColor('#6B7280')
                .text(`Mode: ${report.mode.toUpperCase()} | Secteur: ${report.sector}`, { align: 'center' });

            doc.moveDown(2);
            doc.strokeColor('#E5E7EB')
                .lineWidth(1)
                .moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();

            doc.moveDown(2);

            // Summary
            doc.fillColor('#111827')
                .fontSize(18)
                .font('Helvetica-Bold')
                .text('Résumé Exécutif');

            doc.moveDown();
            doc.fontSize(12)
                .font('Helvetica')
                .fillColor('#374151')
                .text(report.summary, { lineGap: 4 });

            doc.moveDown(2);

            // Sections
            report.sections.forEach((section) => {
                // Check if page break is needed
                if (doc.y > 650) doc.addPage();

                doc.fillColor('#111827')
                    .fontSize(16)
                    .font('Helvetica-Bold')
                    .text(section.title);

                doc.moveDown();

                section.bullets.forEach((bullet) => {
                    doc.fontSize(11)
                        .font('Helvetica')
                        .fillColor('#4B5563')
                        .text(`• ${bullet}`, { indent: 20, lineGap: 5 });
                });

                doc.moveDown(1.5);
            });

            // CTA
            if (report.cta) {
                doc.addPage();
                doc.rect(50, 50, 500, 150)
                    .fill('#F3F4F6');

                doc.fillColor('#111827')
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text('PROCHAINE ÉTAPE', 70, 70);

                doc.moveDown();
                doc.fontSize(12)
                    .font('Helvetica')
                    .text(report.cta, { width: 460 });
            }

            // Footer
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.fillColor('#9CA3AF')
                    .fontSize(8)
                    .text('Généré par The Uprising Game - https://uprising.studio', 50, 750, { align: 'center' });
            }

            // --- PDF CONTENT END ---
            doc.end();
        });

        // Set response headers for download
>>>>>>> origin/master
        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', 'attachment; filename=\"uprising-report.pdf\"');

        return new NextResponse(new Uint8Array(pdfBytes), { headers });
    } catch (error) {
        console.error('[API] PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
    }
}
