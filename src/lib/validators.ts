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

// ─── Type Inference ───────────────────────────────────────────────────────────

export type StartSessionInput = z.infer<typeof StartSessionSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type FetchAuditInput = z.infer<typeof FetchAuditSchema>;
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type SendEmailInput = z.infer<typeof SendEmailSchema>;
export type AdminOverviewInput = z.infer<typeof AdminOverviewSchema>;
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioSchema>;
export type SpeakTextInput = z.infer<typeof SpeakTextSchema>;
