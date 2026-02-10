import { createServiceClient } from './supabase';
import type { TenantAnalytics, SessionMode, UpsellPack, Language, GamificationScore } from '@/types/database';

// ─── B2B Post-Salon Report ────────────────────────────────────────────────────

/**
 * Generate aggregate analytics for a tenant's salon performance.
 */
export async function generateTenantReport(
    tenantId: string,
    periodDays: number = 30
): Promise<TenantAnalytics> {
    const supabase = createServiceClient();
    const periodStart = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();
    const periodEnd = new Date().toISOString();

    // All sessions in period
    const { data: sessions } = await supabase
        .from('sessions')
        .select('id, mode, niche, gamification_json, duration_ms, completed_at, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', periodStart);

    // All leads in period
    const { count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)
        .gte('created_at', periodStart);

    const allSessions = sessions || [];
    const completedSessions = allSessions.filter((s) => s.completed_at !== null);

    // Sessions by mode
    const sessionsByMode = allSessions.reduce(
        (acc, s) => {
            acc[s.mode as SessionMode] = (acc[s.mode as SessionMode] || 0) + 1;
            return acc;
        },
        {} as Record<SessionMode, number>
    );

    // Sessions by niche
    const sessionsByNiche = allSessions.reduce(
        (acc, s) => {
            acc[s.niche] = (acc[s.niche] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // Average maturity score
    const scores = completedSessions
        .filter((s) => s.gamification_json)
        .map((s) => (s.gamification_json as GamificationScore).score);
    const avgScore = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : 0;

    // Average session duration
    const durations = allSessions
        .filter((s) => s.duration_ms)
        .map((s) => s.duration_ms as number);
    const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;

    // Top problems (from unearned badges)
    const problemCounts: Record<string, number> = {};
    completedSessions.forEach((s) => {
        if (s.gamification_json) {
            const gam = s.gamification_json as GamificationScore;
            gam.badges
                .filter((b) => !b.earned)
                .forEach((b) => {
                    problemCounts[b.type] = (problemCounts[b.type] || 0) + 1;
                });
        }
    });
    const topProblems = Object.entries(problemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([problem, count]) => ({ problem, count }));

    // Conversion & email collection
    const leads = totalLeads || 0;
    const conversionRate = allSessions.length > 0
        ? Math.round((leads / allSessions.length) * 100)
        : 0;
    const emailCollectionRate = allSessions.length > 0
        ? Math.round((leads / allSessions.length) * 100)
        : 0;

    return {
        tenant_id: tenantId,
        period_start: periodStart,
        period_end: periodEnd,
        total_sessions: allSessions.length,
        completed_sessions: completedSessions.length,
        total_leads: leads,
        conversion_rate: conversionRate,
        avg_maturity_score: avgScore,
        sessions_by_mode: sessionsByMode,
        sessions_by_niche: sessionsByNiche,
        top_problems: topProblems,
        avg_session_duration_ms: avgDuration,
        email_collection_rate: emailCollectionRate,
    };
}

// ─── Upsell Pack Matching ─────────────────────────────────────────────────────

/**
 * Default upsell packs used if tenant hasn't configured custom ones.
 */
export const DEFAULT_UPSELL_PACKS: UpsellPack[] = [
    {
        id: 'audit-complet',
        name: {
            fr: 'Audit Complet + Plan d\'Action',
            en: 'Complete Audit + Action Plan',
        },
        description: {
            fr: 'Analyse approfondie de votre présence web avec un plan d\'action sur 90 jours, incluant SEO, contenu et stratégie réseaux sociaux.',
            en: 'Deep analysis of your web presence with a 90-day action plan, including SEO, content and social media strategy.',
        },
        price_range: '497$ - 997$',
        target_score_range: [0, 5],
        target_problems: ['seo_presence', 'cta_quality', 'site_score'],
        cta: {
            fr: 'Je veux un audit complet →',
            en: 'I want a complete audit →',
        },
    },
    {
        id: 'refonte-site',
        name: {
            fr: 'Refonte de Site Web Pro',
            en: 'Professional Website Redesign',
        },
        description: {
            fr: 'Site web complet, optimisé mobile et SEO avec système de réservation intégré. Design premium et livré en 3 semaines.',
            en: 'Complete website, mobile and SEO optimized with integrated booking system. Premium design delivered in 3 weeks.',
        },
        price_range: '1,997$ - 4,997$',
        target_score_range: [0, 4],
        target_problems: ['site_score', 'mobile_ready', 'booking_system', 'brand_consistency'],
        cta: {
            fr: 'Parlons de mon nouveau site →',
            en: 'Let\'s talk about my new site →',
        },
    },
    {
        id: 'coaching-digital',
        name: {
            fr: 'Coaching Digital 1-1',
            en: '1-on-1 Digital Coaching',
        },
        description: {
            fr: '4 séances de coaching personnalisé pour optimiser votre marketing digital, améliorer vos réseaux sociaux et automatiser votre prospection.',
            en: '4 personalized coaching sessions to optimize your digital marketing, improve social media and automate prospecting.',
        },
        price_range: '297$ - 597$',
        target_score_range: [4, 7],
        target_problems: ['social_proof', 'offer_clarity'],
        cta: {
            fr: 'Je veux du coaching →',
            en: 'I want coaching →',
        },
    },
    {
        id: 'gestion-reseaux',
        name: {
            fr: 'Gestion Réseaux Sociaux Mensuelle',
            en: 'Monthly Social Media Management',
        },
        description: {
            fr: 'Gestion complète de vos réseaux sociaux: stratégie, contenu, publications et engagement communautaire. Résultats mensuels.',
            en: 'Complete social media management: strategy, content, posts and community engagement. Monthly results.',
        },
        price_range: '497$/mois',
        target_score_range: [3, 8],
        target_problems: ['social_proof', 'brand_consistency'],
        cta: {
            fr: 'Déléguez vos réseaux →',
            en: 'Delegate your social media →',
        },
    },
];

/**
 * Match upsell packs to a visitor's score and detected problems.
 */
export function getMatchingUpsells(
    score: number,
    problems: string[],
    customPacks?: UpsellPack[]
): UpsellPack[] {
    const packs = customPacks && customPacks.length > 0 ? customPacks : DEFAULT_UPSELL_PACKS;

    return packs
        .filter((pack) => {
            const inRange = score >= pack.target_score_range[0] && score <= pack.target_score_range[1];
            const hasMatchingProblem = pack.target_problems.some((p) => problems.includes(p));
            return inRange || hasMatchingProblem;
        })
        .slice(0, 2); // Max 2 upsells per report
}

/**
 * Format upsell packs as text for email insertion.
 */
export function formatUpsellsForEmail(
    upsells: UpsellPack[],
    language: Language
): string {
    if (upsells.length === 0) return '';

    const header = language === 'fr'
        ? '💡 Offres recommandées pour toi:'
        : '💡 Recommended offers for you:';

    const items = upsells.map((u) => {
        const name = u.name[language];
        const desc = u.description[language];
        const cta = u.cta[language];
        return `\n📦 ${name} (${u.price_range})\n${desc}\n${cta}\n`;
    });

    return `${header}\n${items.join('\n')}`;
}
