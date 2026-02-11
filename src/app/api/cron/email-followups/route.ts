import { NextRequest, NextResponse } from 'next/server';
import { processDueFollowups } from '@/lib/email-followups';

function isAuthorized(request: NextRequest) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return false;
    const headerSecret = request.headers.get('x-cron-secret');
    const authHeader = request.headers.get('authorization');
    return headerSecret === secret || authHeader === `Bearer ${secret}`;
}

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const results = await processDueFollowups(100);
        const sent = results.filter((r) => r.status === 'sent').length;
        const errors = results.filter((r) => r.status === 'error').length;
        return NextResponse.json({
            ok: true,
            processed: results.length,
            sent,
            errors,
        });
    } catch (error) {
        console.error('[Cron/EmailFollowups] Error:', error);
        return NextResponse.json({ error: 'Failed to process follow-ups' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    return POST(request);
}
