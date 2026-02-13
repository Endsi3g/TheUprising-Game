'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/use-game';
import { CompanyInfoForm, NicheSelector, ConversationPanel, GameProgressBar } from '@/components/game/GameFlow';
import { LayoutGrid, Utensils, Building2, Stethoscope, LayoutDashboard, ShoppingBag, Palette, Wrench, Laptop, Heart, Home } from 'lucide-react';
import type { Niche } from '@/types/database';
import { AnimatePresence, motion } from 'framer-motion';

const portfolioNiches = [
    { id: 'restauration' as Niche, label: 'Restauration', icon: Utensils },
    { id: 'beaute' as Niche, label: 'Beauté & Bien-être', icon: Palette },
    { id: 'construction' as Niche, label: 'Construction / BTP', icon: Wrench },
    { id: 'immobilier' as Niche, label: 'Immobilier', icon: Building2 },
    { id: 'sante' as Niche, label: 'Santé', icon: Stethoscope },
    { id: 'services_pro' as Niche, label: 'Services Pro', icon: LayoutDashboard },
    { id: 'ecommerce' as Niche, label: 'E-Commerce', icon: ShoppingBag },
    { id: 'coaching' as Niche, label: 'Coaching / Formation', icon: Heart },
    { id: 'marketing_web' as Niche, label: 'Marketing & Web', icon: Laptop },
    { id: 'services_domicile' as Niche, label: 'Services à domicile', icon: Home },
];

export default function PortfolioGamePage() {
    const { state, selectMode, setCompanyInfo, selectNiche } = useGame();
    const router = useRouter();

    useEffect(() => {
        if (!state.mode) {
            selectMode('portfolio');
        }
    }, [state.mode, selectMode]);

    // Handle redirection to results page
    useEffect(() => {
        if (state.phase === 'report_ready' && state.report) {
            router.push('/game/portfolio/results');
        }
    }, [state.phase, state.report, router]);

    const renderPhaseContent = () => {
        if (state.phase === 'mode_select') {
            return (
                <div className="text-center space-y-6">
                    <LayoutGrid className="w-16 h-16 text-blue-500 mx-auto" />
                    <h1 className="text-4xl font-bold">Portfolio par Niche</h1>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Decouvrez des templates et realisations pour votre secteur.
                    </p>
                </div>
            );
        }

        if (state.phase === 'company_info') {
            return <CompanyInfoForm onSubmit={(name) => setCompanyInfo(name)} />;
        }

        if (state.phase === 'niche_select') {
            return <NicheSelector niches={portfolioNiches} onSelect={selectNiche} />;
        }

        if (state.phase === 'conversation' || state.phase === 'generating_report') {
            return <ConversationPanel />;
        }

        if (state.phase === 'report_ready' && state.report) {
            return (
                <div className="space-y-6 text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-gray-500 animate-pulse">Redirection vers votre portfolio...</p>
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
