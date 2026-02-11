import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const SessionModeSchema = z.enum(['startup', 'portfolio', 'audit']);
export const LanguageSchema = z.enum(['fr', 'en']);
export const NicheSchema = z.enum([
    'restauration',
    'beaute',
    'construction',
    'immobilier',
    'sante',
    'services_pro',
    'marketing_web',
    'ecommerce',
    'coaching',
    'services_domicile',
]);

// ─── API Request Schemas ──────────────────────────────────────────────────────

export const StartSessionSchema = z.object({
    tenantId: z.string().uuid(),
    mode: SessionModeSchema,
    language: LanguageSchema.optional().default('fr'),
    niche: NicheSchema.optional(),
});

export const SendMessageSchema = z.object({
    message: z.string().min(1).max(5000),
    voiceTranscript: z.string().optional(),
    meta: z
        .object({
            site_url: z.string().url().optional(),
        })
        .optional(),
});

export const CompleteSessionSchema = z.object({
    // no body required, session ID comes from URL
});

export const FetchAuditSchema = z.object({
    url: z.string().url(),
    sessionId: z.string().uuid(),
});

export const CreateLeadSchema = z.object({
    tenantId: z.string().uuid(),
    sessionId: z.string().uuid(),
    firstName: z.string().min(1).max(200),
    email: z.string().email(),
    sector: z.string().min(1).max(200),
    siteUrl: z.string().url().optional(),
    notes: z.string().max(2000).optional(),
});

export const SendEmailSchema = z.object({
    sessionId: z.string().uuid(),
    email: z.string().email(),
    firstName: z.string().min(1).max(200).optional(),
});

export const AdminOverviewSchema = z.object({
    tenantId: z.string().uuid(),
});

export const ChatRequestSchema = z.object({
    message: z.string().min(1).max(20000),
    history: z.array(z.any()).optional().default([]),
    mode: SessionModeSchema.optional().default('audit'),
    niche: z.string().optional().default('General'),
    language: LanguageSchema.optional().default('fr'),
    sessionId: z.string().uuid().optional(),
});

export const ReportSectionSchema = z.object({
    title: z.string().min(1),
    bullets: z.array(z.string().min(1)),
});

export const ReportJsonSchema = z.object({
    mode: SessionModeSchema,
    language: LanguageSchema,
    sector: z.string().min(1),
    summary: z.string().min(1),
    sections: z.array(ReportSectionSchema).min(1),
    cta: z.string().optional(),
}).passthrough();

export const GenerateReportSchema = z.object({
    mode: SessionModeSchema,
    niche: NicheSchema,
    language: LanguageSchema,
    history: z.array(z.any()).default([]),
    auditHtmlSummary: z.string().optional(),
    sessionId: z.string().uuid().optional(),
});

export const GeneratePdfSchema = z.union([
    ReportJsonSchema,
    z.object({
        report: ReportJsonSchema,
        title: z.string().min(1).optional(),
    }),
]);

export const ContactSchema = z.object({
    firstName: z.string().min(2),
    email: z.string().email(),
    companyName: z.string().optional(),
    projectType: z.enum(['audit', 'startup', 'portfolio', 'other']),
    message: z.string().min(10),
});

export const CreateCheckoutSessionSchema = z.object({
    sessionId: z.string().uuid().optional(),
    email: z.string().email().optional(),
    firstName: z.string().min(1).max(200).optional(),
    mode: SessionModeSchema.optional().default('audit'),
    language: LanguageSchema.optional().default('fr'),
});

// ─── Voice API Schemas ─────────────────────────────────────────────────────

export const TranscribeAudioSchema = z.object({
    sessionId: z.string().uuid(),
    currentLang: LanguageSchema.optional().default('fr'),
    dualLang: z.boolean().optional().default(false),
});

export const SpeakTextSchema = z.object({
    text: z.string().min(1).max(5000),
    sessionId: z.string().uuid(),
    tenantId: z.string().uuid(),
    language: LanguageSchema.optional(),
    stream: z.boolean().optional().default(false),
});

export const TtsSchema = z.object({
    text: z.string().min(1).max(5000),
    language: LanguageSchema.optional().default('fr'),
});

// ─── Type Inference ───────────────────────────────────────────────────────────

export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type FetchAuditInput = z.infer<typeof FetchAuditSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type SendEmailInput = z.infer<typeof SendEmailSchema>;
export type AdminOverviewInput = z.infer<typeof AdminOverviewSchema>;
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioSchema>;
export type SpeakTextInput = z.infer<typeof SpeakTextSchema>;
export type TtsInput = z.infer<typeof TtsSchema>;
export type GenerateReportInput = z.infer<typeof GenerateReportSchema>;
export type GeneratePdfInput = z.infer<typeof GeneratePdfSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type CreateCheckoutSessionInput = z.infer<typeof CreateCheckoutSessionSchema>;
