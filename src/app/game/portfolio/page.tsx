'use client';

import { useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { CompanyInfoForm, NicheSelector, ConversationPanel, GameProgressBar } from '@/components/game/GameFlow';
import { ReportDisplay } from '@/components/game/ReportDisplay';
import { LayoutGrid, Utensils, Building2, Stethoscope, LayoutDashboard, ShoppingBag, Palette, Wrench, Laptop, Heart, Home } from 'lucide-react';
import type { Niche } from '@/types/database';

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

    useEffect(() => {
        if (!state.mode) {
            selectMode('portfolio');
        }
    }, [state.mode, selectMode]);

    return (
        <div className="flex flex-col h-full flex-grow">
            <GameProgressBar />

            <div className="flex-grow flex items-center justify-center p-6 md:p-12">
                {state.phase === 'mode_select' && (
                    <div className="text-center space-y-6">
                        <LayoutGrid className="w-16 h-16 text-blue-500 mx-auto" />
                        <h1 className="text-4xl font-bold">Portfolio par Niche</h1>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Découvrez des templates et réalisations pour votre secteur.
                        </p>
                    </div>
                )}

                {state.phase === 'company_info' && (
                    <CompanyInfoForm onSubmit={(name) => setCompanyInfo(name)} />
                )}

                {state.phase === 'niche_select' && (
                    <NicheSelector niches={portfolioNiches} onSelect={selectNiche} />
                )}

                {(state.phase === 'conversation' || state.phase === 'generating_report') && (
                    <ConversationPanel />
                )}

                {state.phase === 'report_ready' && state.report && (
                    <ReportDisplay
                        report={state.report}
                        title="Votre portfolio d'expert ! 🎨"
                        iconColorClass="bg-blue-500"
                    />
                )}
            </div>
        </div>
    );
}
