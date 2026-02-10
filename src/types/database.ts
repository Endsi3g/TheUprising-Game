// ─── Enums ────────────────────────────────────────────────────────────────────

export type SessionMode = 'startup' | 'portfolio' | 'audit';
export type Language = 'fr' | 'en';
export type AuditStatus = 'pending' | 'done' | 'error';

export type Niche =
    | 'restauration'
    | 'beaute'
    | 'construction'
    | 'immobilier'
    | 'sante'
    | 'services_pro'
    | 'marketing_web'
    | 'ecommerce'
    | 'coaching'
    | 'services_domicile';

export type VoiceStyle = 'friendly' | 'corporate' | 'premium' | 'playful';

export type BadgeType =
    | 'site_score'
    | 'offer_clarity'
    | 'cta_quality'
    | 'social_proof'
    | 'seo_presence'
    | 'mobile_ready'
    | 'booking_system'
    | 'brand_consistency';

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface Badge {
    type: BadgeType;
    label: { fr: string; en: string };
    icon: string;
    earned: boolean;
    description: { fr: string; en: string };
}

export interface GamificationScore {
    score: number; // 0-10
    label: { fr: string; en: string };
    badges: Badge[];
    tier: 'beginner' | 'intermediate' | 'advanced';
}

// ─── Tenant ───────────────────────────────────────────────────────────────────

export interface TenantBranding {
    primary_color: string;
    secondary_color: string;
    logo_url: string;
    font_family?: string;
}

export interface TenantVoiceConfig {
    voice_style: VoiceStyle;
    elevenlabs_voice_id?: string;
    copy_tone: {
        formality: 'tu' | 'vous'; // FR tutor vs formal
        guidelines: string; // free-form instructions
        sample_phrases?: string[];
    };
}

export interface UpsellPack {
    id: string;
    name: { fr: string; en: string };
    description: { fr: string; en: string };
    price_range: string;
    target_score_range: [number, number]; // e.g. [0, 4] for low scores
    target_problems: string[]; // e.g. ['weak_cta', 'no_social_proof']
    cta: { fr: string; en: string };
}

export interface Tenant {
    id: string;
    name: string;
    subdomain: string | null;
    primary_sector: Niche;
    branding: TenantBranding;
    framer_gallery_urls: Record<string, string>;
    voice_config: TenantVoiceConfig | null;
    upsell_packs: UpsellPack[];
    created_at: string;
    updated_at: string;
}

// ─── Template ─────────────────────────────────────────────────────────────────

export interface TemplateConfig {
    sections: string[];
    question_count: number;
    hints?: string[];
}

export interface Template {
    id: string;
    tenant_id: string | null; // null = global template
    mode: SessionMode;
    niche: Niche;
    language: Language;
    system_prompt: string;
    config_json: TemplateConfig;
    created_at: string;
    updated_at: string;
}

// ─── Session ──────────────────────────────────────────────────────────────────

export interface ConversationMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export interface ReportSection {
    title: string;
    bullets: string[];
}

export interface ReportJson {
    mode: SessionMode;
    language: Language;
    sector: string;
    summary: string;
    sections: ReportSection[];
    cta: string;
    // Phase 2 additions
    gamification?: GamificationScore;
    upsells?: UpsellPack[];
    best_practices_used?: string[];
}

export interface Session {
    id: string;
    tenant_id: string;
    mode: SessionMode;
    niche: Niche;
    language: Language;
    raw_input_json: ConversationMessage[];
    report_json: ReportJson | null;
    gamification_json: GamificationScore | null;
    duration_ms: number | null;
    created_at: string;
    completed_at: string | null;
}

// ─── Lead ─────────────────────────────────────────────────────────────────────

export interface Lead {
    id: string;
    tenant_id: string;
    session_id: string;
    first_name: string;
    email: string;
    sector: string;
    site_url: string | null;
    notes: string | null;
    created_at: string;
}

// ─── Audit Run ────────────────────────────────────────────────────────────────

export interface AuditRun {
    id: string;
    session_id: string;
    url: string;
    html_summary: string | null;
    status: AuditStatus;
    created_at: string;
    updated_at: string;
}

// ─── Voice / STT / TTS ───────────────────────────────────────────────────────

export interface VoiceTranscription {
    text: string;
    confidence: number;
    langGuess: Language;
    timestamp: string;
}

export interface LanguageDetectionState {
    history: Array<{ lang: Language; confidence: number }>;
    currentLang: Language;
    switchCount: number;
}

// ─── Event Logging ────────────────────────────────────────────────────────────

export type EventType =
    | 'session.start'
    | 'session.complete'
    | 'session.abandon'
    | 'llm.request'
    | 'llm.response'
    | 'llm.error'
    | 'crawl.start'
    | 'crawl.done'
    | 'crawl.error'
    | 'report.generated'
    | 'email.sent'
    | 'email.error'
    | 'lead.created'
    | 'badge.unlocked'
    | 'voice.transcribe'
    | 'voice.tts'
    | 'voice.lang_switch';

export interface EventLog {
    id: string;
    tenant_id: string;
    session_id: string | null;
    event_type: EventType;
    metadata: Record<string, unknown>;
    created_at: string;
}

// ─── B2B Post-Salon Report ────────────────────────────────────────────────────

export interface TenantAnalytics {
    tenant_id: string;
    period_start: string;
    period_end: string;
    total_sessions: number;
    completed_sessions: number;
    total_leads: number;
    conversion_rate: number;
    avg_maturity_score: number;
    sessions_by_mode: Record<SessionMode, number>;
    sessions_by_niche: Record<string, number>;
    top_problems: Array<{ problem: string; count: number }>;
    avg_session_duration_ms: number;
    email_collection_rate: number;
}
