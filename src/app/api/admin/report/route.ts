import { NextRequest, NextResponse } from 'next/server';
import { generateTenantReport } from '@/lib/b2b-report';
import { requireAdmin } from '@/lib/auth-guard';

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
        const { error: authError } = await requireAdmin(request);
        if (authError) return authError;

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
