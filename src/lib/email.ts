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
}

export async function sendFollowupEmail(opts: {
    to: string;
    firstName?: string;
    followupType: 'day1' | 'day7';
    language?: 'fr' | 'en';
}): Promise<{ id: string }> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@salon-ai.app';
    if (!apiKey) {
        throw new Error('Missing RESEND_API_KEY');
    }

    const resend = new Resend(apiKey);
    const language = opts.language || 'fr';
    const firstName = opts.firstName?.trim();
    const greeting =
        language === 'fr'
            ? firstName ? `Bonjour ${firstName},` : 'Bonjour,'
            : firstName ? `Hello ${firstName},` : 'Hello,';

    const messages = {
        fr: {
            day1: {
                subject: 'Votre plan daction - J+1',
                body: `${greeting}\n\nVoici 3 actions prioritaires a lancer aujourd'hui:\n1) Clarifier votre proposition de valeur sur la page d'accueil.\n2) Ajouter un appel a l'action principal visible des le hero.\n3) Mesurer conversion visite -> lead chaque semaine.\n\nSi vous voulez un accompagnement complet, repondez a cet email.\n\nEquipe Uprising`,
            },
            day7: {
                subject: 'Suivi strategique - J+7',
                body: `${greeting}\n\nUne semaine plus tard, voici la priorite:\n- Faire un point sur ce qui a ete execute\n- Identifier le blocage principal\n- Planifier le prochain sprint de croissance\n\nVous pouvez reserver votre Audit Deep-Dive directement depuis l'application.\n\nEquipe Uprising`,
            },
        },
        en: {
            day1: {
                subject: 'Your action plan - Day 1',
                body: `${greeting}\n\nHere are 3 priority actions to launch today:\n1) Clarify your value proposition on the homepage.\n2) Add one primary above-the-fold call to action.\n3) Track visit -> lead conversion every week.\n\nReply to this email if you want full execution support.\n\nUprising Team`,
            },
            day7: {
                subject: 'Strategic follow-up - Day 7',
                body: `${greeting}\n\nOne week later, focus on:\n- Reviewing what was executed\n- Identifying the main blocker\n- Planning the next growth sprint\n\nYou can book the Deep-Dive Audit directly from the app.\n\nUprising Team`,
            },
        },
    } as const;

    const message = messages[language][opts.followupType];
    const { data, error } = await resend.emails.send({
        from,
        to: opts.to,
        subject: message.subject,
        text: message.body,
    });

    if (error) {
        throw new Error(`Follow-up email failed: ${error.message}`);
    }

    return { id: data?.id || '' };
}
