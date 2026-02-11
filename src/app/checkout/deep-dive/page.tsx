'use client';

import { useState } from 'react';
import { WalletCards, CheckCircle2 } from 'lucide-react';

export default function DeepDiveCheckoutPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/checkout/create-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: 'audit',
                    language: 'fr',
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Unable to create checkout session');
            }

            if (!data.url) {
                throw new Error('Missing checkout URL');
            }

            window.location.href = data.url;
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Unknown error';
            setError(message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-background-dark/50 px-6 py-12">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark p-8 md:p-10 shadow-sm space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                        Audit Deep-Dive
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        Diagnostic premium et plan 90 jours
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Nous passons de l&apos;audit general a un plan d&apos;execution detaille: SEO, conversion, contenu et priorites sprint par sprint.
                    </p>

                    <ul className="space-y-3">
                        {[
                            'Analyse detaillee de votre acquisition et conversion',
                            'Roadmap actionnable sur 90 jours',
                            'Recommandations priorisees par impact business',
                            'Session de restitution strategique',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="pt-2">
                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            <WalletCards className="w-5 h-5" />
                            {loading ? 'Redirection...' : 'Passer au paiement securise'}
                        </button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
