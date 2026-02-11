import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import type { ReportJson } from '@/types/database';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN_X = 50;
const TOP_Y = PAGE_HEIGHT - 60;
const BOTTOM_LIMIT = 70;

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        const width = font.widthOfTextAtSize(test, size);
        if (width <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }

    if (current) lines.push(current);
    return lines;
}

function drawWrappedText(opts: {
    page: PDFPage;
    text: string;
    font: PDFFont;
    size: number;
    x: number;
    y: number;
    maxWidth: number;
    color?: { r: number; g: number; b: number };
    lineHeight?: number;
}) {
    const lines = wrapText(opts.text, opts.font, opts.size, opts.maxWidth);
    let y = opts.y;
    const lineHeight = opts.lineHeight || opts.size * 1.35;

    for (const line of lines) {
        opts.page.drawText(line, {
            x: opts.x,
            y,
            size: opts.size,
            font: opts.font,
            color: rgb(opts.color?.r ?? 0.2, opts.color?.g ?? 0.2, opts.color?.b ?? 0.2),
        });
        y -= lineHeight;
    }

    return y;
}

export async function buildReportPdf(report: ReportJson, title?: string): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = TOP_Y;

    const ensureSpace = (needed = 36) => {
        if (y - needed < BOTTOM_LIMIT) {
            page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
            y = TOP_Y;
        }
    };

    const headerTitle = title || "RAPPORT D'ANALYSE - THE UPRISING";
    page.drawText(headerTitle, {
        x: MARGIN_X,
        y,
        size: 22,
        font: fontBold,
        color: rgb(0.07, 0.09, 0.13),
    });
    y -= 30;

    page.drawText(`Mode: ${report.mode.toUpperCase()} | Secteur: ${report.sector}`, {
        x: MARGIN_X,
        y,
        size: 11,
        font: fontRegular,
        color: rgb(0.35, 0.38, 0.42),
    });
    y -= 22;

    page.drawLine({
        start: { x: MARGIN_X, y },
        end: { x: PAGE_WIDTH - MARGIN_X, y },
        color: rgb(0.89, 0.9, 0.92),
        thickness: 1,
    });
    y -= 26;

    page.drawText('Resume executif', {
        x: MARGIN_X,
        y,
        size: 15,
        font: fontBold,
        color: rgb(0.07, 0.09, 0.13),
    });
    y -= 20;

    y = drawWrappedText({
        page,
        text: report.summary,
        font: fontRegular,
        size: 11,
        x: MARGIN_X,
        y,
        maxWidth: PAGE_WIDTH - MARGIN_X * 2,
        color: { r: 0.22, g: 0.24, b: 0.27 },
    }) - 14;

    for (const section of report.sections || []) {
        ensureSpace(90);
        page.drawText(section.title, {
            x: MARGIN_X,
            y,
            size: 14,
            font: fontBold,
            color: rgb(0.07, 0.09, 0.13),
        });
        y -= 18;

        for (const bullet of section.bullets || []) {
            ensureSpace(50);
            const bulletText = `- ${bullet}`;
            y = drawWrappedText({
                page,
                text: bulletText,
                font: fontRegular,
                size: 10.5,
                x: MARGIN_X + 8,
                y,
                maxWidth: PAGE_WIDTH - MARGIN_X * 2 - 8,
                color: { r: 0.3, g: 0.33, b: 0.36 },
            }) - 4;
        }

        y -= 8;
    }

    if (report.cta) {
        ensureSpace(120);
        page.drawRectangle({
            x: MARGIN_X,
            y: y - 60,
            width: PAGE_WIDTH - MARGIN_X * 2,
            height: 70,
            color: rgb(0.95, 0.96, 0.98),
            borderColor: rgb(0.88, 0.9, 0.93),
            borderWidth: 1,
        });
        y = drawWrappedText({
            page,
            text: report.cta,
            font: fontBold,
            size: 11,
            x: MARGIN_X + 14,
            y: y - 22,
            maxWidth: PAGE_WIDTH - MARGIN_X * 2 - 28,
            color: { r: 0.07, g: 0.09, b: 0.13 },
        }) - 10;
    }

    const pages = pdf.getPages();
    pages.forEach((p, index) => {
        p.drawText(`Genere par The Uprising Game - Page ${index + 1}/${pages.length}`, {
            x: MARGIN_X,
            y: 28,
            size: 8,
            font: fontRegular,
            color: rgb(0.62, 0.65, 0.68),
        });
    });

    return pdf.save();
}
