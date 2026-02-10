import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin, isAuthError } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
    // ── Auth: require admin ──────────────────────────────────────────────
    const auth = await requireAdmin(request);
    if (isAuthError(auth)) return auth.error;

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

        const { data: leads, error } = await supabase
            .from('leads')
            .select('id, first_name, email, sector, site_url, notes, created_at')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch leads' },
                { status: 500 }
            );
        }

        // Generate CSV
        const headers = [
            'ID',
            'First Name',
            'Email',
            'Sector',
            'Website',
            'Notes',
            'Created At',
        ];

        const rows = (leads || []).map((l) =>
            [
                l.id,
                l.first_name,
                l.email,
                l.sector,
                l.site_url || '',
                (l.notes || '').replace(/"/g, '""'),
                l.created_at,
            ]
                .map((v) => `"${v}"`)
                .join(',')
        );

        const csv = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="leads-${tenantId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (err) {
        console.error('[Admin/Leads/CSV] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
