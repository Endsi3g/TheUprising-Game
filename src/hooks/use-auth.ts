import { useState, useEffect } from 'react';
import { createPublicClient } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize client one-time (or memoize if needed, but createPublicClient is simple)
    // Note: In strict mode, verify this doesn't create too many clients.
    // Ideally, the client should be a singleton or from a context.
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

    return { user, session, loading, supabase };
}
