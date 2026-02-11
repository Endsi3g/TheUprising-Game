import { createServiceClient } from '@/lib/supabase';
import { sendFollowupEmail } from '@/lib/email';

type ScheduleFollowupsInput = {
    tenantId?: string;
    sessionId: string;
    email: string;
    firstName?: string;
    language?: 'fr' | 'en';
};

export async function scheduleFollowupEmails(input: ScheduleFollowupsInput) {
    const supabase = createServiceClient();
    const now = Date.now();
    const day1 = new Date(now + 24 * 60 * 60 * 1000).toISOString();
    const day7 = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    const language = input.language || 'fr';

    const rows = [
        {
            tenant_id: input.tenantId || null,
            session_id: input.sessionId,
            email: input.email,
            first_name: input.firstName || null,
            language,
            followup_type: 'day1',
            scheduled_for: day1,
            status: 'pending',
            attempts: 0,
        },
        {
            tenant_id: input.tenantId || null,
            session_id: input.sessionId,
            email: input.email,
            first_name: input.firstName || null,
            language,
            followup_type: 'day7',
            scheduled_for: day7,
            status: 'pending',
            attempts: 0,
        },
    ];

    const { error } = await supabase.from('email_followups').upsert(rows, {
        onConflict: 'email,session_id,followup_type',
    });

    if (error) {
        throw error;
    }
}

export async function processDueFollowups(limit = 50) {
    const supabase = createServiceClient();

    const { data: dueRows, error } = await supabase
        .from('email_followups')
        .select('id, email, first_name, language, followup_type, attempts')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
        .limit(limit);

    if (error) {
        throw error;
    }

    const results: Array<{ id: string; status: 'sent' | 'error'; error?: string }> = [];
    for (const row of dueRows || []) {
        try {
            await sendFollowupEmail({
                to: row.email,
                firstName: row.first_name || undefined,
                followupType: row.followup_type,
                language: row.language || 'fr',
            });

            await supabase
                .from('email_followups')
                .update({
                    status: 'sent',
                    sent_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', row.id);

            results.push({ id: row.id, status: 'sent' });
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown error';
            await supabase
                .from('email_followups')
                .update({
                    status: row.attempts >= 2 ? 'error' : 'pending',
                    attempts: (row.attempts || 0) + 1,
                    last_error: errMsg,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', row.id);

            results.push({ id: row.id, status: 'error', error: errMsg });
        }
    }

    return results;
}
