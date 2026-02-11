import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-guard';

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
        const { count: sessionsCount, error: dbError } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        if (dbError) throw dbError;

        // Completed sessions
        const { count: completedCount, error: compError } = await supabase
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
        const { count: leadsCount, error: leadsError } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        if (leadsError) throw leadsError;

        // Conversion rate
        const conversionRate =
            sessionsCount && sessionsCount > 0
                ? Math.round(((leadsCount || 0) / sessionsCount) * 100)
                : 0;

        // Recent sessions (last 10)
        const { data: recentSessions, error: recentError } = await supabase
            .from('sessions')
            .select('id, mode, niche, language, created_at, completed_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(10);

        if (recentError) throw recentError;

        return NextResponse.json({
            total_sessions: sessionsCount || 0,
            completed_sessions: completedCount || 0,
            total_leads: leadsCount || 0,
            conversion_rate: conversionRate,
            sessions_by_mode: modeBreakdown,
            recent_sessions: recentSessions || [],
        });
    } catch (err) {
        console.error('[Admin/Overview] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
