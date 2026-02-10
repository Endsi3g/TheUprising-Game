import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthResult {
    user: {
        id: string;
        email?: string;
        app_metadata: Record<string, unknown>;
    };
}

interface AuthError {
    error: NextResponse;
}

type AuthOutcome = AuthResult | AuthError;

function isAuthError(result: AuthOutcome): result is AuthError {
    return 'error' in result;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Missing Supabase env vars');
    }
    return createClient(url, key, { auth: { persistSession: false } });
}

function extractToken(req: NextRequest): string | null {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    // Fallback: check for sb-access-token cookie (Supabase SSR)
    const cookie = req.cookies.get('sb-access-token');
    return cookie?.value ?? null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Verify that the request has a valid Supabase JWT.
 * Returns `{ user }` on success or `{ error: NextResponse }` on failure.
 */
export async function requireAuth(req: NextRequest): Promise<AuthOutcome> {
    const token = extractToken(req);

    if (!token) {
        return {
            error: NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            ),
        };
    }

    try {
        const supabase = getSupabaseAdmin();
        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return {
                error: NextResponse.json(
                    { error: 'Invalid or expired token' },
                    { status: 401 }
                ),
            };
        }

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
                app_metadata: data.user.app_metadata ?? {},
            },
        };
    } catch {
        return {
            error: NextResponse.json(
                { error: 'Authentication service unavailable' },
                { status: 503 }
            ),
        };
    }
}

/**
 * Verify that the request has a valid Supabase JWT **and** the user has
 * `is_admin: true` in their `app_metadata`.
 */
export async function requireAdmin(req: NextRequest): Promise<AuthOutcome> {
    const result = await requireAuth(req);

    if (isAuthError(result)) {
        return result;
    }

    if (!result.user.app_metadata?.is_admin) {
        return {
            error: NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            ),
        };
    }

    return result;
}

export { isAuthError };
export type { AuthResult, AuthError, AuthOutcome };
