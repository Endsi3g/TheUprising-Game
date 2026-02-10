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

        const supabase = createPublicClient();

        // Auth Check
        const authHeader = request.headers.get('Authorization');
        const tokenMatch = authHeader?.match(/^Bearer\s+(.+)$/i);
        if (!tokenMatch) {
            return NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 });
        }
        const token = tokenMatch[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Admin check (consistent with login page)
        const adminEmails = ['quebecsaas@gmail.com', 'theuprisingstudio@gmail.com'];
        const isAdminByEmail = user.email ? adminEmails.includes(user.email.toLowerCase()) : false;
        const isAdminByRole = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';

        if (!isAdminByEmail && !isAdminByRole) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

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
