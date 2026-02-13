import { Resend } from 'resend';
import type { ReportJson } from '@/types/database';
import { generatePdf } from './pdf';

/**
 * Sends a report PDF via email using Resend.
 */
export async function sendReportEmail(opts: {
    to: string;
    firstName?: string;
    report: ReportJson;
    sessionId: string;
}): Promise<{ id: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@salon-ai.app';

    if (!apiKey) {
        throw new Error('Missing RESEND_API_KEY');
    }

    const resend = new Resend(apiKey);

    // Generate PDF attachment
    const pdfBuffer = await generatePdf(opts.report);

    const modeLabels: Record<string, Record<string, string>> = {
        startup: { fr: 'Plan de Démarrage', en: 'Startup Plan' },
        portfolio: { fr: 'Portfolio', en: 'Portfolio' },
        audit: { fr: 'Audit de Site Web', en: 'Website Audit' },
    };

    const lang = opts.report.language;
    const modeLabel =
        modeLabels[opts.report.mode]?.[lang] || opts.report.mode;

    const greeting = opts.firstName
        ? lang === 'fr'
            ? `Bonjour ${opts.firstName},`
            : `Hello ${opts.firstName},`
        : lang === 'fr'
            ? 'Bonjour,'
            : 'Hello,';

    const subject =
        lang === 'fr'
            ? `Votre ${modeLabel} – ${opts.report.sector}`
            : `Your ${modeLabel} – ${opts.report.sector}`;

    const body =
        lang === 'fr'
            ? `${greeting}\n\nVeuillez trouver ci-joint votre ${modeLabel.toLowerCase()} pour le secteur "${opts.report.sector}".\n\n${opts.report.summary}\n\nMerci d'avoir utilisé Salon AI !\n\nCordialement,\nL'équipe Salon AI`
            : `${greeting}\n\nPlease find attached your ${modeLabel.toLowerCase()} for the "${opts.report.sector}" sector.\n\n${opts.report.summary}\n\nThank you for using Salon AI!\n\nBest regards,\nThe Salon AI Team`;

    const { data, error } = await resend.emails.send({
        from,
        to: opts.to,
        subject,
        text: body,
        attachments: [
            {
                filename: `salon-ai-${opts.report.mode}-${opts.sessionId.substring(0, 8)}.pdf`,
                content: pdfBuffer,
            },
        ],
    });

    if (error) {
        throw new Error(`Email sending failed: ${error.message}`);
    }

    return { id: data?.id || '' };
    return { id: data?.id || '' };
}
