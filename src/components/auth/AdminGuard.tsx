'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Lock } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, isAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== '/admin/login') {
                router.push('/admin/login');
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-background-dark">
                <div className="space-y-4 text-center">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <p className="text-gray-500">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!user && pathname !== '/admin/login') {
        return null;
    }

    if (user && !isAdmin && pathname !== '/admin/login') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background-dark p-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/10 text-red-600 dark:text-red-400">
                        <Lock className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accès Refusé</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Vous n'avez pas les permissions nécessaires pour accéder à cette zone.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium"
                        >
                            Retour à l'accueil
                        </button>
                        <button
                            onClick={async () => {
                                const { createPublicClient } = await import('@/lib/supabase');
                                const supabase = createPublicClient();
                                await supabase.auth.signOut();
                                router.push('/admin/login');
                            }}
                            className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:underline"
                        >
                            Se connecter avec un autre compte
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
