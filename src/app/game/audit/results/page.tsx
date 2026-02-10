'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/hooks/use-game';
import { ReportDisplay } from '@/components/game/ReportDisplay';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AuditResultsPage() {
    const { state } = useGame();
    const router = useRouter();

    useEffect(() => {
        // If someone lands here without a report, send them back to start
        if (!state.report && state.phase !== 'report_ready' && state.phase !== 'generating_report') {
            router.replace('/game/audit');
        }
    }, [state.report, state.phase, router]);

    if (!state.report) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Récupération de votre rapport...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50/50 dark:bg-background-dark/50">
            {/* Results Header */}
            <div className="bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800 px-6 py-4 sticky top-16 z-40 backdrop-blur-md bg-white/80 dark:bg-background-dark/80">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <Link href="/game/audit" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Nouvel audit
                    </Link>
                    <div className="flex gap-3">
                        <Link
                            href="/contact"
                            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white dark:text-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all"
                        >
                            Obtenir un Devis
                        </Link>
                        <button
                            title="Partager le lien"
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                toast.success("Lien copié dans le presse-papier !");
                            }}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-gray-600 dark:text-gray-400"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <main className="flex-grow p-6 md:p-12">
                <ReportDisplay
                    report={state.report}
                    title="Analyse Terminée ! 🎯"
                    iconColorClass="bg-orange-600"
                />
            </main>
        </div>
    );
}
