import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const mode = searchParams.get('mode');
        const niche = searchParams.get('niche');
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId query parameter is required' },
                { status: 400 }
            );
        }

        const supabase = createServiceClient();

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

        // Admin role check
        const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const offset = (page - 1) * limit;

        // Build query
        let query = supabase
            .from('sessions')
            .select('id, mode, niche, language, gamification_json, duration_ms, created_at, completed_at', { count: 'exact' })
            .eq('tenant_id', tenantId)
            .order(sortBy, { ascending: sortOrder })
            .range(offset, offset + limit - 1);

        // Optional filters
        if (mode) query = query.eq('mode', mode);
        if (niche) query = query.eq('niche', niche);

        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        const { data: sessions, count, error } = await query;

        if (error) {
            console.error('[Admin/Sessions] Query error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch sessions' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            sessions: sessions || [],
            total: count || 0,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit),
        });
    } catch (err) {
        console.error('[Admin/Sessions] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
