export interface CaseStudy {
    id: string;
    name: string;
    industry: string;
    metric: string;
    quote: string;
    logoText: string;
    href: string;
}

export const caseStudies: CaseStudy[] = [
    {
        id: 'e-learning',
        name: 'Plateforme E-Learning',
        industry: 'EdTech',
        metric: '+45% engagement',
        quote: 'Parcours personnalises et meilleure retention eleve.',
        logoText: 'EDU',
        href: '/portfolio/e-learning',
    },
    {
        id: 'analytics-ia',
        name: 'Dashboard Analytics IA',
        industry: 'SaaS B2B',
        metric: 'ROI x3',
        quote: 'Decision plus rapide grace a une lecture claire des donnees.',
        logoText: 'AIX',
        href: '/portfolio/analytics-ia',
    },
    {
        id: 'marketplace-bio',
        name: 'Marketplace Bio',
        industry: 'E-Commerce',
        metric: '+120% conversion',
        quote: 'Refonte conversion-first, tunnel simplifie et resultats mesurables.',
        logoText: 'BIO',
        href: '/portfolio/marketplace-bio',
    },
];
