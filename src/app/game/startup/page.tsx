'use client';

import { useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { CompanyInfoForm, NicheSelector, ConversationPanel, GameProgressBar } from '@/components/game/GameFlow';
import { ReportDisplay } from '@/components/game/ReportDisplay';
import { Rocket, Utensils, Building2, Stethoscope, LayoutDashboard, ShoppingBag, Palette, Wrench, Laptop, Heart, MapPin } from 'lucide-react';
import type { Niche } from '@/types/database';

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
    const { state, selectMode, setCompanyInfo, selectNiche } = useGame();

    // Auto-select startup mode if not already set
    useEffect(() => {
        if (!state.mode) {
            selectMode('startup');
        }
    }, [state.mode, selectMode]);

    return (
        <div className="flex flex-col h-full flex-grow">
            <GameProgressBar />

            <div className="flex-grow flex items-center justify-center p-6 md:p-12">
                {state.phase === 'mode_select' && (
                    <div className="text-center space-y-6">
                        <Rocket className="w-16 h-16 text-green-500 mx-auto" />
                        <h1 className="text-4xl font-bold">Démarrage Entreprise</h1>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Nous allons vous accompagner étape par étape.
                        </p>
                    </div>
                )}

                {state.phase === 'company_info' && (
                    <CompanyInfoForm mode="startup" onSubmit={(name) => setCompanyInfo(name)} />
                )}

                {state.phase === 'niche_select' && (
                    <NicheSelector niches={startupNiches} onSelect={selectNiche} />
                )}

                {(state.phase === 'conversation' || state.phase === 'generating_report') && (
                    <ConversationPanel />
                )}

                {state.phase === 'report_ready' && state.report && (
                    <ReportDisplay
                        report={state.report}
                        title="Votre rapport de démarrage ! 🚀"
                        iconColorClass="bg-green-500"
                    />
                )}
            </div>
        </div>
    );
}
