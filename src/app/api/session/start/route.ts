import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { StartSessionSchema } from '@/lib/validators';
import { getNicheQuestions } from '@/data/templates/niches';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = StartSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { tenantId, mode, language, niche } = parsed.data;
        const supabase = createServiceClient();

        // Verify tenant exists
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, branding, framer_gallery_urls')
            .eq('id', tenantId)
            .single();

        if (tenantError || !tenant) {
            return NextResponse.json(
                { error: 'Tenant not found' },
                { status: 404 }
            );
        }

        // Determine niche (use tenant's primary sector as default)
        const sessionNiche = niche || 'restauration';

        // Create session
        const sessionId = uuidv4();
        const { error: insertError } = await supabase.from('sessions').insert({
            id: sessionId,
            tenant_id: tenantId,
            mode,
            niche: sessionNiche,
            language,
            raw_input_json: [],
            report_json: null,
        });

        if (insertError) {
            console.error('[Session] Insert error:', insertError);
            return NextResponse.json(
                { error: 'Failed to create session' },
                { status: 500 }
            );
        }

        // Get initial questions for the template
        const questions = getNicheQuestions(sessionNiche, mode, language);

        return NextResponse.json({
            sessionId,
            mode,
            niche: sessionNiche,
            language,
            questions,
            tenant: {
                name: tenant.name,
                branding: tenant.branding,
                framerUrl: tenant.framer_gallery_urls?.[sessionNiche] || null,
            },
        });
    } catch (err) {
        console.error('[Session/Start] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
