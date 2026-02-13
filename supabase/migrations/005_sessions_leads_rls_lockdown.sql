-- ============================================================================
-- 005_sessions_leads_rls_lockdown.sql
-- Harden sensitive tables used for session and lead data.
-- Public access is disabled; access must go through server APIs (service role).
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Drop legacy/permissive policies on sessions
DROP POLICY IF EXISTS "sessions_select" ON sessions;
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
DROP POLICY IF EXISTS "sessions_update" ON sessions;
DROP POLICY IF EXISTS "sessions_delete" ON sessions;
DROP POLICY IF EXISTS "sessions_insert_public" ON sessions;
DROP POLICY IF EXISTS "sessions_select_admin" ON sessions;
DROP POLICY IF EXISTS "sessions_update_admin" ON sessions;

-- Drop legacy/permissive policies on leads
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_insert" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_delete" ON leads;
DROP POLICY IF EXISTS "leads_insert_public" ON leads;
DROP POLICY IF EXISTS "leads_select_admin" ON leads;
DROP POLICY IF EXISTS "leads_update_admin" ON leads;

-- Revoke direct table privileges for anon/authenticated clients.
-- Service role bypasses RLS and remains the only intended writer/reader.
REVOKE ALL ON TABLE sessions FROM anon, authenticated;
REVOKE ALL ON TABLE leads FROM anon, authenticated;
