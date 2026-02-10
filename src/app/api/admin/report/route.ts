import { NextRequest, NextResponse } from 'next/server';
import { generateTenantReport } from '@/lib/b2b-report';

import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const periodDays = parseInt(searchParams.get('periodDays') || '30', 10);

        if (!tenantId) {
            return NextResponse.json(
                { error: 'tenantId query parameter is required' },
                { status: 400 }
            );
        }

        // Auth Check
        const supabase = createServiceClient();
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

        const report = await generateTenantReport(tenantId, periodDays);

        return NextResponse.json({ report });
    } catch (err) {
        console.error('[Admin/Report] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
