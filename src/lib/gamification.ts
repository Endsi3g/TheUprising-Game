import type {
    ReportJson,
    GamificationScore,
    Badge,
    BadgeType,
    Language,
} from '@/types/database';

// ─── Badge Definitions ───────────────────────────────────────────────────────

const BADGE_DEFS: Record<
    BadgeType,
    {
        icon: string;
        label: { fr: string; en: string };
        description: { fr: string; en: string };
    }
> = {
    site_score: {
        icon: '🌐',
        label: { fr: 'Site Pro', en: 'Pro Website' },
        description: {
            fr: 'Ton site fait bonne impression',
            en: 'Your website makes a great impression',
        },
    },
    offer_clarity: {
        icon: '💡',
        label: { fr: 'Offre Claire', en: 'Clear Offer' },
        description: {
            fr: 'Ton offre est bien définie et compréhensible',
            en: 'Your offer is well-defined and understandable',
        },
    },
    cta_quality: {
        icon: '🎯',
        label: { fr: 'CTA Efficace', en: 'Effective CTA' },
        description: {
            fr: 'Tes appels à l\'action sont clairs et visibles',
            en: 'Your calls to action are clear and visible',
        },
    },
    social_proof: {
        icon: '⭐',
        label: { fr: 'Preuve Sociale', en: 'Social Proof' },
        description: {
            fr: 'Tu affiches des avis et témoignages',
            en: 'You display reviews and testimonials',
        },
    },
    seo_presence: {
        icon: '🔍',
        label: { fr: 'Visible sur Google', en: 'Google Visible' },
        description: {
            fr: 'Des bases SEO sont en place',
            en: 'Basic SEO foundations are in place',
        },
    },
    mobile_ready: {
        icon: '📱',
        label: { fr: 'Mobile-Friendly', en: 'Mobile-Friendly' },
        description: {
            fr: 'Ton site s\'affiche bien sur mobile',
            en: 'Your site displays well on mobile',
        },
    },
    booking_system: {
        icon: '📅',
        label: { fr: 'Réservation en Ligne', en: 'Online Booking' },
        description: {
            fr: 'Tu offres la réservation en ligne',
            en: 'You offer online booking',
        },
    },
    brand_consistency: {
        icon: '🎨',
        label: { fr: 'Branding Cohérent', en: 'Consistent Branding' },
        description: {
            fr: 'Ton image de marque est cohérente',
            en: 'Your brand image is consistent',
        },
    },
};

// ─── Score Labels ─────────────────────────────────────────────────────────────

function getScoreLabel(score: number): { fr: string; en: string } {
    if (score <= 3) {
        return { fr: 'Potentiel énorme 🚀', en: 'Huge Potential 🚀' };
    }
    if (score <= 5) {
        return { fr: 'Bonne base 👍', en: 'Good Foundation 👍' };
    }
    if (score <= 7) {
        return { fr: 'Solide 💪', en: 'Solid 💪' };
    }
    return { fr: 'Très solide ⭐', en: 'Very Solid ⭐' };
}

function getScoreTier(score: number): 'beginner' | 'intermediate' | 'advanced' {
    if (score <= 3) return 'beginner';
    if (score <= 6) return 'intermediate';
    return 'advanced';
}

// ─── Badge Detection ──────────────────────────────────────────────────────────

/**
 * Analyze report content and audit HTML to determine which badges are earned.
 */
function detectBadges(
    report: ReportJson,
    auditHtml?: string
): Badge[] {
    const reportText = JSON.stringify(report).toLowerCase();
    const auditText = (auditHtml || '').toLowerCase();
    const combined = reportText + ' ' + auditText;

    const checks: Record<BadgeType, () => boolean> = {
        site_score: () => {
            // Earned if they have a website that loads
            return auditText.length > 100;
        },
        offer_clarity: () => {
            // Earned if report mentions clear offer/service descriptions
            const keywords = ['offre', 'offer', 'service', 'package', 'forfait', 'prix', 'price'];
            return keywords.some((k) => combined.includes(k));
        },
        cta_quality: () => {
            // Check for CTA keywords in audit
            const ctaKeywords = ['contact', 'réserver', 'book', 'appeler', 'call', 'soumission', 'quote', 'buy', 'acheter'];
            return ctaKeywords.filter((k) => combined.includes(k)).length >= 2;
        },
        social_proof: () => {
            const proofKeywords = ['avis', 'review', 'témoignage', 'testimonial', 'google', 'étoile', 'star', 'rating'];
            return proofKeywords.some((k) => combined.includes(k));
        },
        seo_presence: () => {
            const seoKeywords = ['meta', 'title', 'description', 'h1', 'seo', 'google'];
            return seoKeywords.filter((k) => combined.includes(k)).length >= 2;
        },
        mobile_ready: () => {
            return combined.includes('responsive') || combined.includes('mobile') || combined.includes('viewport');
        },
        booking_system: () => {
            const bookKeywords = ['réservation', 'booking', 'rendez-vous', 'appointment', 'calendly', 'acuity'];
            return bookKeywords.some((k) => combined.includes(k));
        },
        brand_consistency: () => {
            const brandKeywords = ['logo', 'couleur', 'color', 'brand', 'marque', 'identité', 'identity'];
            return brandKeywords.filter((k) => combined.includes(k)).length >= 2;
        },
    };

    return Object.entries(BADGE_DEFS).map(([type, def]) => ({
        type: type as BadgeType,
        label: def.label,
        icon: def.icon,
        description: def.description,
        earned: checks[type as BadgeType](),
    }));
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

/**
 * Compute the full gamification score and badges from a completed report.
 */
export function computeGamification(
    report: ReportJson,
    auditHtml?: string
): GamificationScore {
    const badges = detectBadges(report, auditHtml);
    const earnedCount = badges.filter((b) => b.earned).length;

    // Base score: earned badges contribute proportionally to a 0-10 scale
    // 8 total badges → each earned badge ≈ 1.25 points
    const rawScore = Math.round((earnedCount / badges.length) * 10);

    // Bonus: completeness of report sections
    const sectionBonus = Math.min(report.sections.length, 5) * 0.2;
    const score = Math.min(10, Math.round(rawScore + sectionBonus));

    return {
        score,
        label: getScoreLabel(score),
        badges,
        tier: getScoreTier(score),
    };
}

/**
 * Get a list of detected problems based on unearned badges.
 */
export function detectProblems(
    gamification: GamificationScore,
    language: Language
): string[] {
    return gamification.badges
        .filter((b) => !b.earned)
        .map((b) => {
            const problemMap: Record<BadgeType, { fr: string; en: string }> = {
                site_score: { fr: 'Site web absent ou inaccessible', en: 'Website missing or inaccessible' },
                offer_clarity: { fr: 'Offre peu claire', en: 'Unclear offer' },
                cta_quality: { fr: 'CTA faibles ou absents', en: 'Weak or missing CTAs' },
                social_proof: { fr: 'Manque de preuve sociale', en: 'Lack of social proof' },
                seo_presence: { fr: 'SEO de base manquant', en: 'Basic SEO missing' },
                mobile_ready: { fr: 'Site non adapté mobile', en: 'Not mobile-friendly' },
                booking_system: { fr: 'Pas de réservation en ligne', en: 'No online booking' },
                brand_consistency: { fr: 'Branding incohérent', en: 'Inconsistent branding' },
            };
            return problemMap[b.type][language];
        });
}
