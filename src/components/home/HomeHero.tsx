'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, BrainCircuit } from 'lucide-react';
import { FramerSection } from '@/components/ui/FramerSection';

interface HomeHeroProps {
    framerUrl?: string | null;
}

export function HomeHero({ framerUrl }: HomeHeroProps) {
    return (
        <FramerSection
            url={framerUrl}
            title="Home Hero Framer"
            className="w-full max-w-5xl"
            minHeightClassName="min-h-[420px]"
        >
            <div className="relative overflow-hidden rounded-[2.4rem] border border-gray-200 bg-gradient-to-br from-white via-slate-50 to-orange-50 px-6 py-10 shadow-soft md:px-12 md:py-14">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55 }}
                    className="relative z-10 space-y-6"
                >
                    <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-600">
                        <Sparkles className="h-3.5 w-3.5" />
                        Experience Designer
                    </div>
                    <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-6xl">
                        Transformez une visite stand en opportunite commerciale en moins de 5 minutes.
                    </h1>
                    <p className="max-w-2xl text-base text-gray-600 md:text-lg">
                        Wizard IA conversationnel, audit expert, et conversion en lead avec une interface immersive.
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            href="/game/audit"
                            className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                        >
                            Lancer un audit
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            href="/portfolio"
                            className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-400 hover:text-black"
                        >
                            Voir le portfolio
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.08 }}
                    className="pointer-events-none absolute -right-8 top-5 hidden h-60 w-60 rounded-full bg-orange-100/80 blur-3xl md:block"
                />
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="pointer-events-none absolute bottom-4 right-4 hidden rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur md:flex md:items-center md:gap-2"
                >
                    <BrainCircuit className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-semibold text-gray-700">IA active en direct</span>
                </motion.div>
            </div>
        </FramerSection>
    );
}
