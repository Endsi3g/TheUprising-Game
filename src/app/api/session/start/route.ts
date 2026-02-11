import { NextRequest, NextResponse } from 'next/server';
import { StartSessionSchema } from '@/lib/validators';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { SessionStartError, startSessionService } from '@/lib/session-start';
import { TENANT_ID } from '@/lib/config';

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, 'session-start', RATE_LIMITS.sessionStart)) {
        return rateLimitResponse(60);
    }

    try {
        const body = await request.json();
        const parsed = StartSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { mode, language, niche } = parsed.data;
        const payload = await startSessionService({
            tenantId: TENANT_ID,
            mode,
            language,
            niche,
        });

        return NextResponse.json(payload);
    } catch (err) {
        if (err instanceof SessionStartError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('[Session/Start] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
