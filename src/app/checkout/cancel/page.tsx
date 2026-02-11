import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gray-50/50 dark:bg-background-dark/50">
            <div className="max-w-xl w-full rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-surface-dark p-10 text-center space-y-6 shadow-sm">
                <h1 className="text-3xl font-black tracking-tight">Paiement annule</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Aucun debit n'a ete effectue. Vous pouvez reprendre plus tard quand vous etes pret.
                </p>
                <Link
                    href="/checkout/deep-dive"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold hover:opacity-90 transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Revenir au checkout
                </Link>
            </div>
        </div>
    );
}
