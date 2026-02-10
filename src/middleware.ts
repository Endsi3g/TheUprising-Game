import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
// Note: This is ephemeral and per-instance/isolate. For production scale, use Redis (Upstash).
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20; // 20 requests per minute per IP

// Clean up map periodically to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
        if (now > record.resetTime) {
            rateLimitMap.delete(ip);
        }
    }
}, WINDOW_SIZE);

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Define sensitive paths (redundant with matcher but good for safety)
    if (
        path.startsWith('/api/chat') ||
        path.startsWith('/api/voice') ||
        path.startsWith('/api/session/start')
    ) {
        const ip = (request as any).ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
        const now = Date.now();
        const record = rateLimitMap.get(ip);

        if (record && now < record.resetTime) {
            if (record.count >= MAX_REQUESTS) {
                return new NextResponse('Too Many Requests', { status: 429 });
            }
            record.count++;
        } else {
            rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_SIZE });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/chat/:path*',
        '/api/voice/:path*',
        '/api/session/start',
    ],
};
