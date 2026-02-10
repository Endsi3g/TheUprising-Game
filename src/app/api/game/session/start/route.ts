import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { z } from 'zod';

const StartSessionSchema = z.object({
    mode: z.enum(['startup', 'portfolio', 'audit']),
    niche: z.string(),
    language: z.enum(['fr', 'en']).default('fr'),
    companyName: z.string(),
    siteUrl: z.string().optional(),
});

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = StartSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Invalid request',
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { mode, niche, language, companyName, siteUrl } = parsed.data;
        const supabase = createServiceClient();

        // Create a new session in DB
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                tenant_id: DEMO_TENANT_ID,
                mode,
                niche,
                language,
                raw_input_json: [{ role: 'system', content: `Session started for ${companyName} (${siteUrl || 'no URL'})` }],
            })
            .select('id')
            .single();

        if (sessionError) throw sessionError;

        // Optional: Pre-create a lead record 
        if (companyName) {
            await supabase.from('leads').insert({
                tenant_id: DEMO_TENANT_ID,
                session_id: session.id,
                first_name: companyName,
                site_url: siteUrl,
                sector: niche,
                email: 'anonymous@game.local',
            });
        }

        return NextResponse.json({ sessionId: session.id });
    } catch (error: unknown) {
        console.error('Error starting session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
