import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { ContactSchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { sendContactEmail } from '@/lib/email';
import { TENANT_ID } from '@/lib/config';

export async function POST(req: Request) {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 'contact', RATE_LIMITS.contact)) {
        return rateLimitResponse(60);
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

        // Insert into leads table
        const { data, error } = await supabase
            .from('leads')
            .insert({
                tenant_id: TENANT_ID,
                session_id: validated.sessionId || null,
                first_name: validated.firstName,
                email: validated.email,
                sector: validated.projectType, // We'll use sector to store the project type for contact leads
                site_url: null,
                notes: `Company: ${validated.companyName || 'N/A'}\n\nMessage:\n${validated.message}`,
            })
            .select()
            .single();

        if (error) {
            console.error('[API] Failed to save contact lead:', error);
            return NextResponse.json({ error: 'Failed to save contact request' }, { status: 500 });
        }

        // Send notification email (fire and forget)
        sendContactEmail({
            name: validated.firstName,
            email: validated.email,
            type: validated.projectType,
            company: validated.companyName,
            message: validated.message,
        }).catch(err => console.error('[Email] Failed to notify admin:', err));

        return NextResponse.json({ success: true, leadId: data.id });
    } catch (error) {
        console.error('[API] Contact submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
