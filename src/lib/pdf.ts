import type { ReportJson } from '@/types/database';
import { buildReportPdf } from './pdf-builder';

/**
 * Generates a PDF buffer from a structured report JSON.
 */
export async function generatePdf(report: ReportJson): Promise<Buffer> {
    const bytes = await buildReportPdf(report);
    return Buffer.from(bytes);
}
