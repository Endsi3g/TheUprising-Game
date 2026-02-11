import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { SendEmailSchema } from '@/lib/validators';
import { sendReportEmail } from '@/lib/email';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { scheduleFollowupEmails } from '@/lib/email-followups';

export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip, 'email-send', { limit: 5, windowMs: 60 * 1000 })) {
        return rateLimitResponse();
    }

    try {
        const body = await request.json();
        const parsed = SendEmailSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { sessionId, email, firstName } = parsed.data;
        const supabase = createServiceClient();

        // Fetch session report
        const { data: session, error } = await supabase
            .from('sessions')
            .select('report_json, tenant_id')
            .eq('id', sessionId)
            .single();

        if (error || !session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        if (!session.report_json) {
            return NextResponse.json(
                { error: 'Report not yet generated' },
                { status: 400 }
            );
        }

        // Send email with PDF
        const result = await sendReportEmail({
            to: email,
            firstName,
            report: session.report_json,
            sessionId,
        });

        try {
            await scheduleFollowupEmails({
                tenantId: (session as { tenant_id?: string }).tenant_id,
                sessionId,
                email,
                firstName,
                language: session.report_json.language || 'fr',
            });
        } catch (scheduleError) {
            console.error('[Email/Send] Failed to schedule follow-ups:', scheduleError);
        }

        return NextResponse.json({
            success: true,
            emailId: result.id,
        });
    } catch (err) {
        console.error('[Email/Send] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
