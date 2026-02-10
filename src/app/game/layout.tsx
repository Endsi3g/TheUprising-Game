'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { GameProvider } from '@/hooks/use-game';
import { getPhaseProgress, getPhaseLabel, type GamePhase } from '@/lib/game-state';

function ProgressBar({ phase, language }: { phase: GamePhase; language: 'fr' | 'en' }) {
    const progress = getPhaseProgress(phase);
    const label = getPhaseLabel(phase, language);

    return (
        <div className="w-full max-w-md">
            <div className="flex justify-between items-center text-xs font-medium text-gray-500 mb-1.5">
                <span>{label}</span>
                <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                    className="bg-black dark:bg-white h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}

export default function GameLayout({ children }: { children: React.ReactNode }) {
    return (
        <GameProvider>
            <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans">

                {/* Header */}
                <header className="sticky top-0 z-50 w-full px-6 md:px-8 py-4 flex justify-between items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                    <Link href="/" className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium tracking-wide">Accueil</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium tracking-wider uppercase opacity-60">The Uprising Game</span>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-grow flex flex-col relative">
                    {children}
                </main>
            </div>
        </GameProvider>
    );
}

export { ProgressBar };
