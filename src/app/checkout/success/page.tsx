import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function CheckoutSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50/50 dark:bg-background-dark/50">
            <div className="max-w-xl w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark p-10 text-center space-y-6 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">Paiement confirme</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Merci. L'equipe Uprising vous contacte rapidement pour enclencher votre Audit Deep-Dive.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 transition-all"
                >
                    Retour accueil
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
