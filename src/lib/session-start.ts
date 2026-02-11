import { getNicheQuestions } from '@/data/templates/niches';
import { logSessionStart } from '@/lib/logger';
import { createServiceClient } from '@/lib/supabase';
import type { Language, Niche, SessionMode } from '@/types/database';

export class SessionStartError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

interface StartSessionServiceInput {
    tenantId: string;
    mode: SessionMode;
    language: Language;
    niche?: Niche;
}

interface StartSessionServiceResult {
    sessionId: string;
    mode: SessionMode;
    niche: Niche;
    language: Language;
    questions: string[];
    tenant: {
        name: string;
        branding: unknown;
        framerUrl: string | null;
    };
}

export async function startSessionService(
    input: StartSessionServiceInput
): Promise<StartSessionServiceResult> {
    const supabase = createServiceClient();

    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('id, name, branding, framer_gallery_urls, primary_sector')
        .eq('id', input.tenantId)
        .single();

    if (tenantError || !tenant) {
        throw new SessionStartError('Tenant not found', 404);
    }

    const sessionNiche = (input.niche || tenant.primary_sector || 'restauration') as Niche;

    const { data: session, error: insertError } = await supabase
        .from('sessions')
        .insert({
            tenant_id: input.tenantId,
            mode: input.mode,
            niche: sessionNiche,
            language: input.language,
            raw_input_json: [],
            report_json: null,
        })
        .select('id')
        .single();

    if (insertError || !session) {
        throw new SessionStartError('Failed to create session', 500);
    }

    void logSessionStart(input.tenantId, session.id, input.mode, sessionNiche);

    const questions = getNicheQuestions(sessionNiche, input.mode, input.language);
    const framerUrls = tenant.framer_gallery_urls as Record<string, string> | null;

    return {
        sessionId: session.id,
        mode: input.mode,
        niche: sessionNiche,
        language: input.language,
        questions,
        tenant: {
            name: tenant.name,
            branding: tenant.branding,
            framerUrl: framerUrls?.[sessionNiche] || null,
        },
    };
}
