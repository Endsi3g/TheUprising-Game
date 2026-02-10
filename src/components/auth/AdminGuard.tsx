'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

// Admin emails for fallback access (when app_metadata.is_admin is not set)
const ADMIN_EMAILS = ['quebecsaas@gmail.com', 'theuprisingstudio@gmail.com'];

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isAdmin =
        user?.app_metadata?.is_admin === true ||
        user?.app_metadata?.role === 'admin' ||
        (user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false);

    useEffect(() => {
        if (!loading && !user && pathname !== '/admin/login') {
            router.push('/admin/login');
        }
        if (!loading && user && !isAdmin && pathname !== '/admin/login') {
            router.push('/');
        }
    }, [user, loading, router, pathname, isAdmin]);

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
        return null;
    }

    return <>{children}</>;
}
