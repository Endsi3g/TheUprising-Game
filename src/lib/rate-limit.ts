import { NextRequest, NextResponse } from 'next/server';

export interface RateLimitConfig {
    limit: number; // Max requests
    windowMs: number; // Time window in ms
}

export const RATE_LIMITS = {
    analyticsEvent: { limit: 120, windowMs: 60 * 1000 },
    chat: { limit: 20, windowMs: 60 * 1000 },
    contact: { limit: 5, windowMs: 60 * 1000 },
    emailSend: { limit: 5, windowMs: 60 * 1000 },
    gameSessionStart: { limit: 20, windowMs: 60 * 1000 },
    generatePdf: { limit: 8, windowMs: 60 * 1000 },
    generateReport: { limit: 3, windowMs: 60 * 1000 },
    lead: { limit: 10, windowMs: 60 * 1000 },
    sessionComplete: { limit: 3, windowMs: 60 * 1000 },
    sessionMessage: { limit: 30, windowMs: 60 * 1000 },
    sessionStart: { limit: 10, windowMs: 60 * 1000 },
    tts: { limit: 10, windowMs: 60 * 1000 },
    transcribe: { limit: 5, windowMs: 60 * 1000 },
} as const;

const limiters = new Map<string, Map<string, number[]>>();

/**
 * Basic in-memory rate limiter.
 * Returns true if allowed, false if blocked.
 */
export function checkRateLimit(ip: string, endpoint: string, config: RateLimitConfig): boolean {
    if (!limiters.has(endpoint)) {
        limiters.set(endpoint, new Map());
    }

    const endpointLimiter = limiters.get(endpoint)!;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const timestamps = endpointLimiter.get(ip) || [];

    // Filter out old timestamps
    const validTimestamps = timestamps.filter(t => t > windowStart);

    if (validTimestamps.length >= config.limit) {
        return false;
    }

    validTimestamps.push(now);
    endpointLimiter.set(ip, validTimestamps);

    // Periodic cleanup (naive) - could be optimized
    if (Math.random() < 0.01) {
        for (const [key, times] of endpointLimiter.entries()) {
            const fresh = times.filter(t => t > windowStart);
            if (fresh.length === 0) {
                endpointLimiter.delete(key);
            } else {
                endpointLimiter.set(key, fresh);
            }
        }
    }

    return true;
}

function fingerprint(value: string): string {
    let hash = 5381;
    for (let i = 0; i < value.length; i += 1) {
        hash = (hash * 33) ^ value.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
}

export function getClientIp(req: Request | NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0]?.trim();
        if (first) return first;
    }

    const realIp = req.headers.get('x-real-ip')?.trim();
    if (realIp) return realIp;

    const cfIp = req.headers.get('cf-connecting-ip')?.trim();
    if (cfIp) return cfIp;

    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `unknown:${fingerprint(userAgent)}`;
}

export function rateLimitResponse(retryAfterSeconds = 60) {
    return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        {
            status: 429,
            headers: {
                'Retry-After': String(retryAfterSeconds),
                'Cache-Control': 'no-store',
            },
        }
    );
}
