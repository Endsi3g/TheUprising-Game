'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase';
import { LayoutGrid, Mail, Lock, ArrowRight, Loader2, Play } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createPublicClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [magicLinkSent, setMagicLinkSent] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push('/admin');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Échec de la connexion';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleMagicLink = async () => {
        if (!email) {
            setError('Veuillez entrer votre email pour le lien magique');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/admin`,
                },
            });

            if (error) throw error;
            setMagicLinkSent(true);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Échec de l\'envoi du lien magique';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            </div>

            {/* Header */}
            <header className="p-8 z-10">
                <Link href="/" className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <LayoutGrid className="w-6 h-6" />
                    <span className="text-sm font-medium tracking-widest uppercase">The Uprising</span>
                </Link>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 z-10">
                <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">Espace Partenaire</h1>
                        <p className="text-gray-400 text-lg">Connectez-vous pour accéder au dashboard.</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm animate-in shake duration-300">
                            {error}
                        </div>
                    )}

                    {magicLinkSent ? (
                        <div className="text-center p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 space-y-6">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                <Mail className="w-6 h-6 text-green-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">Vérifiez vos emails</h2>
                                <p className="text-gray-400">Un lien de connexion magique a été envoyé à <strong>{email}</strong>.</p>
                            </div>
                            <button
                                onClick={() => setMagicLinkSent(false)}
                                className="text-sm text-gray-500 hover:text-white transition-colors"
                            >
                                Retour à la connexion classique
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Email professionnel</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="nom@entreprise.com"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all text-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">Mot de passe</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/50 focus:bg-white/10 transition-all text-lg"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                        <>
                                            Continuer
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-black px-2 text-gray-500">Ou alternative</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleMagicLink}
                                    disabled={loading}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                                    Recevoir un lien magique
                                </button>
                            </div>
                        </form>
                    )}

                    <p className="text-center text-sm text-gray-500 pt-10">
                        Pas encore partenaire ? <Link href="mailto:hello@uprising.agency" className="text-white hover:underline decoration-1 underline-offset-4">Rejoignez l&apos;Uprising</Link>
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-8 text-center text-[10px] text-gray-600 uppercase tracking-[0.2em] z-10">
                © 2026 The Uprising Agency — All Rights Reserved
            </footer>
        </div>
    );
}
