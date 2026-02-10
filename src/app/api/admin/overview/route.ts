import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

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

        const supabase = createServiceClient();

        // Auth Check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Total sessions
        const { count: sessionsCount, error: dbError } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        if (dbError) throw dbError;

        // Completed sessions
        const { count: completedCount } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .not('completed_at', 'is', null);

        // Sessions by mode
        const { data: sessionsByMode } = await supabase
            .from('sessions')
            .select('mode')
            .eq('tenant_id', tenantId);

        const modeBreakdown = (sessionsByMode || []).reduce(
            (acc, s) => {
                acc[s.mode] = (acc[s.mode] || 0) + 1;
                return acc;
            },
            {} as Record<string, number>
        );

        // Total leads
        const { count: leadsCount } = await supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', tenantId);

        // Conversion rate
        const conversionRate =
            sessionsCount && sessionsCount > 0
                ? Math.round(((leadsCount || 0) / sessionsCount) * 100)
                : 0;

        // Recent sessions (last 10)
        const { data: recentSessions } = await supabase
            .from('sessions')
            .select('id, mode, niche, language, created_at, completed_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            sessionsCount: sessionsCount || 0,
            completedCount: completedCount || 0,
            leadsCount: leadsCount || 0,
            conversionRate,
            sessionsByMode: modeBreakdown,
            recentSessions: recentSessions || [],
        });
    } catch (err) {
        console.error('[Admin/Overview] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
