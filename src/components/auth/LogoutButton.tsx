'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function LogoutButton() {
    const router = useRouter();
    const { supabase } = useAuth();

    const handleLogout = async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
        >
            <LogOut className="w-5 h-5" />
            Déconnexion
        </button>
    );
}
