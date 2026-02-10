import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth-guard';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');

        const supabase = createServiceClient();

        // Auth Check
        const { error: authError } = await requireAdmin(request);
        if (authError) return authError;

        if (tenantId) {
            // Get specific tenant
            const { data: tenant, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('id', tenantId)
                .single();

            if (error || !tenant) {
                return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
            }
            return NextResponse.json({ tenant });
        }

        // List all tenants
        const { data: tenants, error } = await supabase
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch tenants' }, { status: 500 });
        }

        return NextResponse.json({ tenants: tenants || [] });
    } catch (err) {
        console.error('[Admin/Tenants] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { tenantId, ...updates } = body;

        if (!tenantId) {
            return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
        }

        const supabase = createServiceClient();

        // Auth Check
        const { error: authError } = await requireAdmin(request);
        if (authError) return authError;

        // Only allow updating specific fields
        const allowedFields: Record<string, unknown> = {};
        if (updates.name) allowedFields.name = updates.name;
        if (updates.branding) allowedFields.branding = updates.branding;
        if (updates.voice_config !== undefined) allowedFields.voice_config = updates.voice_config;
        if (updates.upsell_packs !== undefined) allowedFields.upsell_packs = updates.upsell_packs;
        if (updates.framer_gallery_urls) allowedFields.framer_gallery_urls = updates.framer_gallery_urls;
        if (updates.primary_sector) allowedFields.primary_sector = updates.primary_sector;

        allowedFields.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('tenants')
            .update(allowedFields)
            .eq('id', tenantId)
            .select()
            .single();

        if (error) {
            console.error('[Admin/Tenants] Update error:', error);
            return NextResponse.json({ error: 'Failed to update tenant' }, { status: 500 });
        }

        return NextResponse.json({ tenant: data });
    } catch (err) {
        console.error('[Admin/Tenants] PUT Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
