'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user && pathname !== '/admin/login') {
            router.push('/admin/login');
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
        return null; // Will redirect
    }

    return <>{children}</>;
}
