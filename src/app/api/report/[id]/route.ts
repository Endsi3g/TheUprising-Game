import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;
        const supabase = createServiceClient();

        const { data: session, error } = await supabase
            .from('sessions')
            .select('report_json, mode, niche, language, completed_at')
            .eq('id', sessionId)
            .single();

        if (error || !session) {
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            );
        }

        if (!session.report_json) {
            return NextResponse.json(
                { error: 'Report not yet generated' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            report: session.report_json,
            mode: session.mode,
            niche: session.niche,
            language: session.language,
            completedAt: session.completed_at,
        });
    } catch (err) {
        console.error('[Report] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
