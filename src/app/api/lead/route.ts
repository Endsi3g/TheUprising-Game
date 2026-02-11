import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { CreateLeadSchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { logLeadCreated } from '@/lib/logger';
import { TENANT_ID } from '@/lib/config';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, 'lead', RATE_LIMITS.lead)) {
        return rateLimitResponse(60);
    }

    try {
        const body = await request.json();
        const parsed = CreateLeadSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { sessionId, firstName, email, sector, siteUrl, notes } =
            parsed.data;

        const supabase = createServiceClient();

        // Check existing lead to report insert/update status reliably.
        const { data: existingLead, error: existingError } = await supabase
            .from('leads')
            .select('id')
            .eq('session_id', sessionId)
            .eq('email', email)
            .maybeSingle();

        if (existingError) {
            console.error('[Lead] Existing lookup error:', existingError);
            return NextResponse.json(
                { error: 'Failed to lookup lead' },
                { status: 500 }
            );
        }

        const payload = {
            session_id: sessionId,
            tenant_id: TENANT_ID,
            email,
            first_name: firstName,
            sector,
            site_url: siteUrl || null,
            notes: notes || null,
            ...(existingLead ? { updated_at: new Date().toISOString() } : {}),
        };

        // Atomic upsert guarded by DB unique index (session_id, email).
        const { data: upserted, error: upsertError } = await supabase
            .from('leads')
            .upsert(payload, {
                onConflict: 'session_id, email',
            })
            .select('id, created_at, updated_at')
            .single();

        if (upsertError) {
            console.error('[Lead] Upsert error:', upsertError);
            return NextResponse.json(
                { error: 'Failed to save lead' },
                { status: 500 }
            );
        }

        const isUpdated =
            Boolean(existingLead) ||
            (Boolean(upserted.updated_at) && upserted.updated_at !== upserted.created_at);
        if (!isUpdated) {
            void logLeadCreated(TENANT_ID, sessionId, email);
        }
        return NextResponse.json({ leadId: upserted.id, updated: isUpdated });


    } catch (err) {
        console.error('[Lead] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
