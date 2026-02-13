'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/use-game';
import { CompanyInfoForm, NicheSelector, ConversationPanel, GameProgressBar } from '@/components/game/GameFlow';
import { ReportGenerationView } from '@/components/game/ReportGenerationView';
import { Rocket, Utensils, Building2, Stethoscope, LayoutDashboard, ShoppingBag, Palette, Wrench, Laptop, Heart, MapPin } from 'lucide-react';
import type { Niche } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';

const startupNiches = [
    { id: 'restauration' as Niche, label: 'Restauration', icon: Utensils },
    { id: 'beaute' as Niche, label: 'Beauté & Bien-être', icon: Palette },
    { id: 'construction' as Niche, label: 'Construction / BTP', icon: Wrench },
    { id: 'immobilier' as Niche, label: 'Immobilier', icon: Building2 },
    { id: 'sante' as Niche, label: 'Santé', icon: Stethoscope },
    { id: 'services_pro' as Niche, label: 'Services Pro', icon: LayoutDashboard },
    { id: 'ecommerce' as Niche, label: 'E-Commerce', icon: ShoppingBag },
    { id: 'coaching' as Niche, label: 'Coaching / Formation', icon: Heart },
    { id: 'marketing_web' as Niche, label: 'Marketing & Web', icon: Laptop },
    { id: 'services_domicile' as Niche, label: 'Services à domicile', icon: MapPin },
];

export default function StartupGamePage() {
    const { state, selectMode, setCompanyInfo, selectNiche, reset } = useGame();
    const router = useRouter();

    // Force reset on entry to ensure a fresh start
    useEffect(() => {
        localStorage.removeItem('uprising_game_state');
        reset();
        selectMode('startup');
    }, [reset, selectMode]);

    // Handle redirection to results page
    useEffect(() => {
        if (state.phase === 'report_ready' && state.report) {
            router.push('/game/startup/results');
        }
    }, [state.phase, state.report, router]);

    const renderPhaseContent = () => {
        if (state.phase === 'mode_select') {
            return (
                <div className="text-center space-y-6">
                    <Rocket className="w-16 h-16 text-green-500 mx-auto" />
                    <h1 className="text-4xl font-bold">Demarrage Entreprise</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Nous allons vous accompagner etape par etape.
                    </p>
                </div>
            );
        }

        if (state.phase === 'company_info') {
            return <CompanyInfoForm mode="startup" onSubmit={(name) => setCompanyInfo(name)} />;
        }

        if (state.phase === 'niche_select') {
            return <NicheSelector niches={startupNiches} onSelect={selectNiche} />;
        }

        if (state.phase === 'conversation') {
            return <ConversationPanel />;
        }

        if (state.phase === 'generating_report') {
            return <ReportGenerationView />;
        }

        if (state.phase === 'report_ready' && state.report) {
            return (
                <div className="space-y-6 text-center">
                    <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 animate-pulse">Redirection vers votre plan...</p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col h-full flex-grow">
            <GameProgressBar />

            <div className="flex-grow flex items-center justify-center p-6 md:p-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={state.phase}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.99 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                        className="w-full"
                    >
                        {renderPhaseContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
