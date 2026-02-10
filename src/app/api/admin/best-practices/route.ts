import { NextRequest, NextResponse } from 'next/server';
import { getBestPractices, formatBestPracticesForPrompt } from '@/data/best-practices';
import type { Niche, Language } from '@/types/database';

const VALID_NICHES: Niche[] = [
    'restauration', 'beaute', 'construction', 'immobilier', 'sante',
    'services_pro', 'marketing_web', 'ecommerce', 'coaching', 'services_domicile',
];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const niche = searchParams.get('niche') as Niche | null;
        const language = (searchParams.get('language') || 'fr') as Language;
        const format = searchParams.get('format') || 'json';

        if (!niche || !VALID_NICHES.includes(niche)) {
            return NextResponse.json(
                { error: `niche is required. Valid: ${VALID_NICHES.join(', ')}` },
                { status: 400 }
            );
        }

        if (format === 'text') {
            const text = formatBestPracticesForPrompt(niche, language);
            return new NextResponse(text, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        const practices = getBestPractices(niche);

        return NextResponse.json({
            niche,
            language,
            practices: {
                recommended_ctas: practices.recommended_ctas[language],
                essential_sections: practices.essential_sections[language],
                offer_ideas: practices.offer_ideas[language],
                common_errors: practices.common_errors[language],
            },
        });
    } catch (err) {
        console.error('[Admin/BestPractices] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
