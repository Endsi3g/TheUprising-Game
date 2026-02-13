import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-guard';
import { FUNNEL_EVENTS } from '@/lib/analytics/events';

const toRate = (numerator: number, denominator: number) => {
    if (!denominator || denominator <= 0) return 0;
    return Math.round((numerator / denominator) * 100);
};

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId query parameter is required' },
                { status: 400 }
            );
        }

        // Auth Check
        const { error: authError } = await requireAdmin(request);
        if (authError) return authError;

        const supabase = createServiceClient();

        // Total sessions
        const { count: totalSessions, error: dbError } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        if (dbError) throw dbError;

        // Completed sessions
        const { count: completedSessions, error: compError } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .not('completed_at', 'is', null);

        if (compError) throw compError;

        // Sessions by mode
        const { data: sessionsByMode, error: modeError } = await supabase
            .from('sessions')
            .select('mode')
            .eq('tenant_id', tenantId);

        if (modeError) throw modeError;

        const modeBreakdown = (sessionsByMode || []).reduce(
            (acc, s) => {
                acc[s.mode] = (acc[s.mode] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        // Total leads
        const { count: totalLeads, error: leadsError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        if (leadsError) throw leadsError;

        // Conversion rate
        const conversionRate = toRate(totalLeads || 0, totalSessions || 0);

        // Recent sessions (last 10)
        const { data: recentSessions, error: recentError } = await supabase
            .from('sessions')
            .select('id, mode, niche, language, created_at, completed_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (recentError) throw recentError;

        // Funnel step 1: Home visits tracked in event_logs
        const { count: visitCount, error: visitError } = await supabase
            .from('event_logs')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('event_type', FUNNEL_EVENTS.VISIT_HOME);

        if (visitError) throw visitError;

        // Funnel step 2: audit sessions started
        const { data: auditSessionRows, count: auditStartedCount, error: auditStartError } = await supabase
            .from('sessions')
            .select('id', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .eq('mode', 'audit');

        if (auditStartError) throw auditStartError;

        // Funnel step 3: audit sessions completed
        const { count: auditCompletedCount, error: auditCompletedError } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .eq('mode', 'audit')
            .not('completed_at', 'is', null);

        if (auditCompletedError) throw auditCompletedError;

        // Funnel step 4: leads linked to audit sessions
        let auditLeadCount = 0;
        const auditSessionIds = (auditSessionRows || []).map((row) => row.id);
        if (auditSessionIds.length > 0) {
            const { count: countedAuditLeads, error: auditLeadError } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenantId)
                .in('session_id', auditSessionIds);

            if (auditLeadError) throw auditLeadError;
            auditLeadCount = countedAuditLeads || 0;
        }

        const visits = visitCount || 0;
        const auditsStarted = auditStartedCount || 0;
        const auditsCompleted = auditCompletedCount || 0;
        const leadsCreated = auditLeadCount;

        return NextResponse.json({
<<<<<<< HEAD
            total_sessions: sessionsCount || 0,
            completed_sessions: completedCount || 0,
            total_leads: leadsCount || 0,
            conversion_rate: conversionRate,
            sessions_by_mode: modeBreakdown,
            recent_sessions: recentSessions || [],
=======
            total_sessions: totalSessions || 0,
            completed_sessions: completedSessions || 0,
            total_leads: totalLeads || 0,
            conversion_rate: conversionRate,
            sessions_by_mode: modeBreakdown,
            recent_sessions: recentSessions || [],
            funnel: {
                visits,
                audits_started: auditsStarted,
                audits_completed: auditsCompleted,
                leads_created: leadsCreated,
                visit_to_start_rate: toRate(auditsStarted, visits),
                start_to_complete_rate: toRate(auditsCompleted, auditsStarted),
                complete_to_lead_rate: toRate(leadsCreated, auditsCompleted),
                full_funnel_rate: toRate(leadsCreated, visits),
            },
            analytics: {
                ga4_enabled: Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID),
                plausible_enabled: Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
            },
>>>>>>> origin/master
        });
    } catch (err) {
        console.error('[Admin/Overview] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
