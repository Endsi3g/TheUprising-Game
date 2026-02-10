'use client';

import Link from 'next/link';
import { Rocket, LayoutGrid, Search, ArrowRight } from 'lucide-react';

const modes = [
    {
        id: 'startup' as const,
        title: 'Démarrage Entreprise',
        description: 'Validez votre idée, créez votre business plan et lancez votre entreprise avec l\u0027aide de l\u0027IA.',
        icon: Rocket,
        color: 'from-green-500 to-emerald-600',
        bgHover: 'hover:border-green-400 dark:hover:border-green-500',
        href: '/game/startup',
    },
    {
        id: 'portfolio' as const,
        title: 'Portfolio par Niche',
        description: 'Explorez des templates et réalisations adaptés à votre secteur d\u0027activité.',
        icon: LayoutGrid,
        color: 'from-blue-500 to-indigo-600',
        bgHover: 'hover:border-blue-400 dark:hover:border-blue-500',
        href: '/game/portfolio',
    },
    {
        id: 'audit' as const,
        title: 'Audit Site Existant',
        description: 'Analysez votre site web actuel et obtenez un rapport personnalisé avec des recommandations.',
        icon: Search,
        color: 'from-orange-500 to-red-600',
        bgHover: 'hover:border-orange-400 dark:hover:border-orange-500',
        href: '/game/audit',
    },
];

export default function GameModePage() {
    return (
        <div className="flex-grow flex flex-col items-center justify-center px-6 md:px-8 py-12">
            {/* Background Decor */}
            <div className="absolute top-1/4 left-10 w-80 h-80 bg-indigo-50 dark:bg-indigo-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-green-50 dark:bg-green-900/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40 pointer-events-none"></div>

            <div className="w-full max-w-5xl z-10 space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <span className="inline-block px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full">
                        Choisissez votre parcours
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                        Comment puis-je vous aider ?
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-light max-w-2xl mx-auto">
                        Sélectionnez un mode pour commencer votre expérience interactive avec notre assistant IA.
                    </p>
                </div>

                {/* Mode Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modes.map((mode) => (
                        <Link
                            key={mode.id}
                            href={mode.href}
                            className={`group relative flex flex-col p-8 bg-white dark:bg-surface-dark border-2 border-gray-100 dark:border-gray-800 rounded-2xl transition-all duration-300 ${mode.bgHover} hover:shadow-xl hover:-translate-y-1`}
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                <mode.icon className="w-7 h-7 text-white" />
                            </div>

                            {/* Content */}
                            <h2 className="text-xl font-bold mb-3">{mode.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed flex-grow">
                                {mode.description}
                            </p>

                            {/* CTA */}
                            <div className="flex items-center gap-2 mt-6 text-sm font-medium text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                <span>Commencer</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
