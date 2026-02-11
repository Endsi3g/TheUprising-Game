import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { ContactSchema } from '@/lib/validators';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { TENANT_ID } from '@/lib/config';
import { scheduleFollowupEmails } from '@/lib/email-followups';

export async function POST(req: Request) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip, 'contact', { limit: 5, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
    }

    try {
        const body = await req.json();
        const parsed = ContactSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: parsed.error.flatten() },
                { status: 400 }
            );
        }
        const validated = parsed.data;

        const supabase = createServiceClient();

        const mode = validated.projectType === 'startup'
            ? 'startup'
            : validated.projectType === 'portfolio'
                ? 'portfolio'
                : 'audit';

        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                tenant_id: TENANT_ID,
                mode,
                niche: 'services_pro',
                language: 'fr',
                raw_input_json: [
                    {
                        role: 'user',
                        content: validated.message,
                        timestamp: new Date().toISOString(),
                    },
                ],
            })
            .select('id')
            .single();

        if (sessionError || !session) {
            console.error('[API] Failed to create contact session:', sessionError);
            return NextResponse.json({ error: 'Failed to create contact session' }, { status: 500 });
        }

        const { data, error } = await supabase
            .from('leads')
            .insert({
                tenant_id: TENANT_ID,
                session_id: session.id,
                first_name: validated.firstName,
                email: validated.email,
                sector: validated.projectType, // We'll use sector to store the project type for contact leads
                notes: `Company: ${validated.companyName || 'N/A'}\n\nMessage:\n${validated.message}`,
            })
            .select()
            .single();

        if (error) {
            console.error('[API] Failed to save contact lead:', error);
            return NextResponse.json({ error: 'Failed to save contact request' }, { status: 500 });
        }

        try {
            await scheduleFollowupEmails({
                tenantId: TENANT_ID,
                sessionId: session.id,
                email: validated.email,
                firstName: validated.firstName,
                language: 'fr',
            });
        } catch (scheduleError) {
            console.error('[API] Failed to schedule follow-ups from contact:', scheduleError);
        }

        return NextResponse.json({ success: true, leadId: data.id });
    } catch (error) {
        console.error('[API] Contact submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
