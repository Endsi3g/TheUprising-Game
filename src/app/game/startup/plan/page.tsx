'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, CalendarClock, CheckCircle2, Rocket, WalletCards } from 'lucide-react';
import { useGame } from '@/hooks/use-game';

type RoadmapPhase = {
    id: string;
    title: string;
    description: string;
    items: string[];
    window: string;
};

const copy = {
    fr: {
        badge: 'Roadmap Startup',
        title: 'Plan de lancement',
        subtitle: 'Un plan operationnel en 3 phases pour passer de lidee au produit monnayable.',
        mvp: 'MVP',
        v1: 'V1',
        v2: 'V2',
        resourcesTitle: 'Ressources a prevoir',
        resources: [
            'Fondateur produit + support technique',
            'Budget acquisition initial et outils no-code / IA',
            'Cadence hebdo: build -> test -> feedback client',
        ],
        ctas: {
            contact: 'Parler a lequipe',
            checkout: 'Acheter Audit Deep-Dive',
            back: 'Retour Startup',
        },
        summaryPrefix: 'Projet',
        defaultProject: 'votre startup',
        timelinePrefix: 'Horizon',
    },
    en: {
        badge: 'Startup Roadmap',
        title: 'Launch plan',
        subtitle: 'A 3-phase execution plan to move from idea to a monetizable product.',
        mvp: 'MVP',
        v1: 'V1',
        v2: 'V2',
        resourcesTitle: 'Required resources',
        resources: [
            'Product founder + technical support',
            'Initial acquisition budget and no-code / AI stack',
            'Weekly cadence: build -> test -> customer feedback',
        ],
        ctas: {
            contact: 'Talk to the team',
            checkout: 'Buy Deep-Dive Audit',
            back: 'Back to Startup',
        },
        summaryPrefix: 'Project',
        defaultProject: 'your startup',
        timelinePrefix: 'Timeline',
    },
} as const;

function getRoadmap(language: 'fr' | 'en'): RoadmapPhase[] {
    if (language === 'en') {
        return [
            {
                id: 'mvp',
                title: 'MVP',
                description: 'Validate positioning and core value proposition.',
                items: [
                    'Define one core customer segment and one key problem.',
                    'Ship one conversion-oriented landing + lead capture flow.',
                    'Run 10 customer interviews and extract offer objections.',
                ],
                window: 'Weeks 1-4',
            },
            {
                id: 'v1',
                title: 'V1',
                description: 'Operationalize delivery and first paid conversions.',
                items: [
                    'Package your offer into 2-3 clear paid tiers.',
                    'Deploy automated onboarding and report delivery.',
                    'Track funnel from visit to paid conversion.',
                ],
                window: 'Weeks 5-10',
            },
            {
                id: 'v2',
                title: 'V2',
                description: 'Scale with repeatable growth and retention systems.',
                items: [
                    'Add retention loops (follow-up email + referral incentives).',
                    'Expand channels based on CAC/LTV signals.',
                    'Establish monthly operating metrics and forecast model.',
                ],
                window: 'Weeks 11-16',
            },
        ];
    }

    return [
        {
            id: 'mvp',
            title: 'MVP',
            description: 'Valider le positionnement et la promesse centrale.',
            items: [
                'Choisir une cible prioritaire et un probleme principal.',
                'Livrer une landing orientee conversion + capture de leads.',
                'Mener 10 entrevues clients et isoler les objections.',
            ],
            window: 'Semaines 1-4',
        },
        {
            id: 'v1',
            title: 'V1',
            description: 'Industrialiser la livraison et les premieres ventes.',
            items: [
                'Structurer loffre en 2-3 packs payants clairs.',
                'Activer onboarding automatise et remise de rapport.',
                'Mesurer le funnel de la visite a la conversion payante.',
            ],
            window: 'Semaines 5-10',
        },
        {
            id: 'v2',
            title: 'V2',
            description: 'Passer a une croissance repetable avec retention.',
            items: [
                'Ajouter des boucles retention (follow-up + parrainage).',
                'Etendre les canaux selon CAC/LTV observes.',
                'Piloter une revue mensuelle metriques + previsions.',
            ],
            window: 'Semaines 11-16',
        },
    ];
}

export default function StartupPlanPage() {
    const { state } = useGame();
    const language = state.language === 'en' ? 'en' : 'fr';
    const t = copy[language];
    const roadmap = useMemo(() => getRoadmap(language), [language]);
    const projectName = state.companyName || t.defaultProject;

    const phaseLabel = {
        mvp: t.mvp,
        v1: t.v1,
        v2: t.v2,
    } as const;

    return (
        <div className="min-h-screen bg-gray-50/40 dark:bg-background-dark/40">
            <header className="sticky top-16 z-30 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-background-dark/90 backdrop-blur">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/game/startup/results" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        {t.ctas.back}
                    </Link>
                    <span className="text-xs font-bold uppercase tracking-widest text-green-600">{t.badge}</span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 md:py-12 space-y-8">
                <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark p-8 md:p-10 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 text-green-600">
                        <Rocket className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">{t.summaryPrefix}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">{t.title}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl">
                        {projectName}: {t.subtitle}
                    </p>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        {t.timelinePrefix}: 16 weeks
                    </p>
                </section>

                <section className="grid md:grid-cols-3 gap-4">
                    {roadmap.map((phase) => (
                        <article key={phase.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark p-6 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">{phaseLabel[phase.id as keyof typeof phaseLabel]}</span>
                                <span className="text-xs font-semibold text-green-700 dark:text-green-400">{phase.window}</span>
                            </div>
                            <h2 className="text-xl font-bold">{phase.title}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{phase.description}</p>
                            <ul className="space-y-2">
                                {phase.items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </section>

                <section className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark p-8 space-y-5">
                    <h2 className="text-xl font-bold">{t.resourcesTitle}</h2>
                    <ul className="space-y-2">
                        {t.resources.map((item) => (
                            <li key={item} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                                <CalendarClock className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Link href="/contact" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold hover:opacity-90 transition-all">
                            {t.ctas.contact}
                        </Link>
                        <Link href="/checkout/deep-dive" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                            <WalletCards className="w-4 h-4" />
                            {t.ctas.checkout}
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
