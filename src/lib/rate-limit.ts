import { NextRequest, NextResponse } from 'next/server';

// ─── In-Memory Token Bucket ──────────────────────────────────────────────────

interface Bucket {
    tokens: number;
    lastRefill: number;
}

const buckets = new Map<string, Bucket>();

// Cleanup stale buckets every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
const BUCKET_EXPIRY = 10 * 60 * 1000;

let lastCleanup = Date.now();

function cleanup() {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;

    for (const [key, bucket] of buckets) {
        if (now - bucket.lastRefill > BUCKET_EXPIRY) {
            buckets.delete(key);
        }
    }
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

interface RateLimitConfig {
    /** Unique identifier prefix for the limiter (e.g. 'chat', 'tts') */
    prefix: string;
    /** Maximum requests per window */
    max: number;
    /** Window size in milliseconds (default: 60_000 = 1 minute) */
    windowMs?: number;
}

interface RateLimitResult {
    limited: boolean;
    remaining: number;
    resetInMs: number;
}

function getClientIp(req: NextRequest): string {
    return (
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        'unknown'
    );
}

/**
 * Check whether the request should be rate-limited.
 * Uses an in-memory token-bucket per IP + prefix.
 */
export function checkRateLimit(
    req: NextRequest,
    config: RateLimitConfig
): RateLimitResult {
    cleanup();

    const ip = getClientIp(req);
    const key = `${config.prefix}:${ip}`;
    const windowMs = config.windowMs ?? 60_000;
    const now = Date.now();

    let bucket = buckets.get(key);

    if (!bucket) {
        bucket = { tokens: config.max - 1, lastRefill: now };
        buckets.set(key, bucket);
        return { limited: false, remaining: bucket.tokens, resetInMs: windowMs };
    }

    // Refill tokens based on elapsed time
    const elapsed = now - bucket.lastRefill;
    const refillRate = config.max / windowMs;
    const refill = Math.floor(elapsed * refillRate);

    if (refill > 0) {
        bucket.tokens = Math.min(config.max, bucket.tokens + refill);
        bucket.lastRefill = now;
    }

    if (bucket.tokens <= 0) {
        const resetInMs = Math.ceil((1 - bucket.tokens) / refillRate);
        return { limited: true, remaining: 0, resetInMs };
    }

    bucket.tokens -= 1;
    return {
        limited: false,
        remaining: bucket.tokens,
        resetInMs: windowMs - elapsed,
    };
}

/**
 * Convenience: returns a 429 NextResponse if rate-limited,
 * otherwise returns null (request is allowed).
 */
export function rateLimitGuard(
    req: NextRequest,
    config: RateLimitConfig
): NextResponse | null {
    const result = checkRateLimit(req, config);

    if (result.limited) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil(result.resetInMs / 1000)),
                    'X-RateLimit-Remaining': '0',
                },
            }
        );
    }

    return null;
}
