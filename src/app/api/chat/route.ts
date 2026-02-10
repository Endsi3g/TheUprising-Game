
import { NextRequest, NextResponse } from 'next/server';
import { chat } from '@/lib/llm';
import { rateLimitGuard } from '@/lib/rate-limit';
import { z } from 'zod';
import type { Niche } from '@/types/database';

// ─── Validation Schema ───────────────────────────────────────────────────────

const ChatRequestSchema = z.object({
    message: z.string().min(1).max(5000),
    history: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.string().optional().default(() => new Date().toISOString()),
    })).optional().default([]),
    mode: z.enum(['startup', 'portfolio', 'audit']).optional().default('audit'),
    niche: z.enum([
        'restauration', 'beaute', 'construction', 'immobilier', 'sante',
        'services_pro', 'marketing_web', 'ecommerce', 'coaching', 'services_domicile',
    ]).optional(),
    language: z.enum(['fr', 'en']).optional().default('fr'),
});

export async function POST(req: NextRequest) {
    // ── Rate limiting (20 req/min per IP) ────────────────────────────────
    const limited = rateLimitGuard(req, { prefix: 'chat', max: 20 });
    if (limited) return limited;

    try {
        const body = await req.json();

        // ── Validate input with Zod ──────────────────────────────────────
        const parsed = ChatRequestSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { message, history, mode, niche, language } = parsed.data;

        const response = await chat({
            userMessage: message,
            history: history.map(h => ({ ...h, timestamp: h.timestamp || new Date().toISOString() })),
            mode,
            niche: (niche || 'restauration') as Niche,
            language,
        });

        return NextResponse.json(response);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Internal Server Error';
        console.error('[API] Chat error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
