import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createPublicClient } from './supabase';
import { ADMIN_EMAILS } from './config';

export type AuthResult =
  | { user: any; error: null }
  | { user: null; error: NextResponse };

/**
 * Validates that the request has a valid Bearer token and the user is an Admin.
 * Usage:
 * const { user, error } = await requireAdmin(req);
 * if (error) return error;
 */
export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization');
  const tokenMatch = authHeader?.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Missing or malformed Authorization header' }, { status: 401 })
    };
  }

  const token = tokenMatch[1];
  const supabase = createPublicClient(); // Use public client to verify general auth state

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }

  // Admin Check Logic
  // 1. Check strict email allowlist
  const isAdminByEmail = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;

  // 2. Check metadata roles
  const isAdminByRole =
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.role === 'admin';

  if (!isAdminByEmail && !isAdminByRole) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    };
  }

  return { user, error: null };
}
