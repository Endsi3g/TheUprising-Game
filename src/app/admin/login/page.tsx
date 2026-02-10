'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LayoutGrid, Lock, Mail, AlertCircle } from 'lucide-react';

const supabase = createPublicClient();

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Check if user is admin
            const user = data.user;
            const adminEmails = ['quebecsaas@gmail.com', 'theuprisingstudio@gmail.com'];
            const isAdminByEmail = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;
            const isAdminByRole = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
            const isAdmin = isAdminByEmail || isAdminByRole;

            if (!isAdmin) {
                await supabase.auth.signOut();
                throw new Error("Accès refusé : vous n'avez pas les droits d'administrateur.");
            }

            router.push('/admin');
        } catch (err: any) {
            setError(err.message || 'Échec de la connexion');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Administration
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Connectez-vous pour accéder au tableau de bord
                    </p>
                </div>

                <Card className="border-border-light dark:border-border-dark shadow-xl bg-white dark:bg-surface-dark">
                    <CardHeader>
                        <CardTitle className="text-xl">Connexion</CardTitle>
                        <CardDescription>
                            Entrez vos identifiants administrateur
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 flex items-center gap-3 text-sm text-red-600 dark:text-red-400">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                                disabled={loading}
                            >
                                {loading ? 'Connexion...' : 'Se connecter'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Button
                        variant="link"
                        className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                        onClick={() => router.push('/')}
                    >
                        Retour à l'accueil
                    </Button>
                </div>
            </div>
        </div>
    );
}
