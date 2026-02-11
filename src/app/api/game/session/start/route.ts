import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIp, RATE_LIMITS, rateLimitResponse } from '@/lib/rate-limit';
import { TENANT_ID } from '@/lib/config';
import { SessionStartError, startSessionService } from '@/lib/session-start';
import type { Niche } from '@/types/database';

const StartSessionSchema = z.object({
    mode: z.enum(['startup', 'portfolio', 'audit']),
    niche: z.string(),
    language: z.enum(['fr', 'en']).default('fr'),
    companyName: z.string(),
    siteUrl: z.string().optional(),
});

export async function POST(req: Request) {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 'game-session-start', RATE_LIMITS.gameSessionStart)) {
        return rateLimitResponse(60);
    }

    try {
        const body = await req.json();
        const parsed = StartSessionSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({
                error: 'Invalid request',
                details: parsed.error.flatten()
            }, { status: 400 });
        }

        const { mode, niche, language } = parsed.data;
        const payload = await startSessionService({
            tenantId: TENANT_ID,
            mode,
            niche: niche as Niche,
            language,
        });

        return NextResponse.json({ sessionId: payload.sessionId });
    } catch (error: unknown) {
        if (error instanceof SessionStartError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Error starting session:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
