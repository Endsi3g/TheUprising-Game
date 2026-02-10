import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const eventType = searchParams.get('eventType');
        const sessionId = searchParams.get('sessionId');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '50', 10);

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId query parameter is required' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

        // Auth Check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const offset = (page - 1) * limit;

        let query = supabase
            .from('event_logs')
            .select('*', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (eventType) query = query.eq('event_type', eventType);
        if (sessionId) query = query.eq('session_id', sessionId);

        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        const { data: events, count, error } = await query;

        if (error) {
            console.error('[Admin/Events] Query error:', error);
            return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
        }

        // Aggregate counts by event type for the summary
        const { data: typeCounts } = await supabase
            .from('event_logs')
            .select('event_type')
            .eq('tenant_id', tenantId);

        const summary: Record<string, number> = {};
        (typeCounts || []).forEach((e: { event_type: string }) => {
            summary[e.event_type] = (summary[e.event_type] || 0) + 1;
        });

        return NextResponse.json({
            events: events || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
            summary,
        });
    } catch (err) {
        console.error('[Admin/Events] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
