'use client';

import { motion } from 'framer-motion';
import { Globe2, TrendingUp, Sparkles, Timer } from 'lucide-react';
import { FramerSection } from '@/components/ui/FramerSection';

interface PortfolioBenefitsProps {
    framerUrl?: string | null;
}

const benefits = [
    {
        title: 'Design orienté conversion',
        description: 'Chaque interface est pensée pour guider vers une action mesurable.',
        icon: TrendingUp,
    },
    {
        title: 'Exécution ultra-rapide',
        description: 'Des concepts validés vite, avec itérations courtes et pilotage visuel.',
        icon: Timer,
    },
    {
        title: 'Narration de marque',
        description: 'Un univers cohérent entre UX, copywriting et storytelling.',
        icon: Sparkles,
    },
    {
        title: 'Prêt pour l’international',
        description: 'Architecture et contenu adaptés au scaling multi-marchés.',
        icon: Globe2,
    },
];

export function PortfolioBenefits({ framerUrl }: PortfolioBenefitsProps) {
    return (
        <FramerSection
            url={framerUrl}
            title="Portfolio Benefits Framer"
            className="mt-16 w-full"
            minHeightClassName="min-h-[360px]"
        >
            <div className="mt-14 rounded-[2.4rem] border border-gray-200 bg-white p-8 shadow-soft md:p-10">
                <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">Pourquoi nous</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                            Un portfolio qui performe autant qu’il inspire.
                        </h2>
                    </div>
                    <p className="max-w-md text-sm text-gray-500">
                        Ces principes guident nos choix design, développement et stratégie de conversion.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.title}
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.35, delay: index * 0.08 }}
                            className="rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-6"
                        >
                            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <benefit.icon className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{benefit.title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">{benefit.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </FramerSection>
    );
}
