
import { NextResponse } from 'next/server';
import { chat } from '@/lib/llm';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history, mode, niche, language } = body;

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required and must be a string' }, { status: 400 });
        }

        if (history && !Array.isArray(history)) {
            return NextResponse.json({ error: 'History must be an array' }, { status: 400 });
        }

        const response = await chat({
            userMessage: message,
            history: history || [],
            mode: mode || 'audit',
            niche: niche || 'General',
            language: language || 'fr',
        });

        return NextResponse.json(response);
    } catch (error: any) {
        console.error('[API] Chat error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
