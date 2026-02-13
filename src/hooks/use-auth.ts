import { useMemo, useState, useEffect } from 'react';
import { createPublicClient } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { ADMIN_EMAILS } from '@/lib/config';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createPublicClient();

    useEffect(() => {
        let mounted = true;

        async function getInitialSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);
                    setLoading(false);
                }
            } catch (error) {
                console.error("[useAuth] Failed to get session:", error);
                if (mounted) setLoading(false);
            }
        }

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const isAdminByEmail = user?.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
    const isAdminByRole = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
    const isAdmin = isAdminByEmail || isAdminByRole;

    return { user, session, loading, supabase, isAdmin };
}
