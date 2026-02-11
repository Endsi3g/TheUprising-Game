import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { TENANT_ID } from '@/lib/config';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { SERVER_EVENT_TYPES } from '@/lib/analytics/events';

const AnalyticsEventSchema = z.object({
    eventType: z.enum(SERVER_EVENT_TYPES),
    sessionId: z.string().uuid().optional(),
    tenantId: z.string().uuid().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

function sanitizeMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!metadata) return {};

    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata).slice(0, 24)) {
        if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            normalized[key] = value;
            continue;
        }
        normalized[key] = JSON.stringify(value).slice(0, 500);
    }
    return normalized;
}

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, 'analytics-event', RATE_LIMITS.analyticsEvent)) {
        return rateLimitResponse(60);
    }

    try {
        const body = await request.json();
        const parsed = AnalyticsEventSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid analytics payload', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const payload = parsed.data;
        const supabase = createServiceClient();

        const { error: insertError } = await supabase.from('event_logs').insert({
            tenant_id: TENANT_ID,
            session_id: payload.sessionId || null,
            event_type: payload.eventType,
            metadata: {
                ip,
                ...sanitizeMetadata(payload.metadata),
            },
        });

        if (insertError) {
            console.error('[Analytics/Event] Insert error:', insertError);
            return NextResponse.json({ error: 'Failed to persist analytics event' }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[Analytics/Event] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
