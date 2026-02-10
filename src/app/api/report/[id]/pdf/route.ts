import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { generatePdf } from '@/lib/pdf';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;
        const supabase = createServiceClient();

        const { data: session, error } = await supabase
            .from('sessions')
            .select('report_json, mode')
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

        const pdfBuffer = await generatePdf(session.report_json);
        const uint8 = new Uint8Array(pdfBuffer);

        return new NextResponse(uint8, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="salon-ai-${session.mode}-${sessionId.substring(0, 8)}.pdf"`,
                'Content-Length': pdfBuffer.length.toString(),
            },
        });
    } catch (err) {
        console.error('[Report/PDF] Error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
