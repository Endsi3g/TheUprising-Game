import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { CreateLeadSchema } from '@/lib/validators';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = CreateLeadSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { tenantId, sessionId, firstName, email, sector, siteUrl, notes } =
            parsed.data;

        const supabase = createServiceClient();

        // Atomic Upsert (Insert or Update if conflict on session_id + email)
        const { data: upserted, error: upsertError } = await supabase
            .from('leads')
            .upsert({
                session_id: sessionId,
                tenant_id: tenantId,
                email,
                first_name: firstName,
                sector,
                site_url: siteUrl || null,
                notes: notes || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'session_id, email',
            })
            .select()
            .single();

        if (upsertError) {
            console.error('[Lead] Upsert error:', upsertError);
            return NextResponse.json(
                { error: 'Failed to save lead' },
                { status: 500 }
            );
        }

        const isUpdated = upserted.updated_at !== upserted.created_at;
        return NextResponse.json({ leadId: upserted.id, updated: isUpdated });


    } catch (err) {
        console.error('[Lead] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
