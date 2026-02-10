import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
    limit: number; // Max requests
    windowMs: number; // Time window in ms
}

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

export function rateLimitResponse() {
    return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
    );
}
