-- ============================================================================
-- 007_rls_hardening.sql
-- Harden event and audit tables so only server APIs (service role) can access.
-- ============================================================================

ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies that may allow direct client access.
DROP POLICY IF EXISTS "event_logs_select" ON event_logs;
DROP POLICY IF EXISTS "event_logs_insert" ON event_logs;
DROP POLICY IF EXISTS "event_logs_select_admin" ON event_logs;
DROP POLICY IF EXISTS "event_logs_insert_public" ON event_logs;

DROP POLICY IF EXISTS "audit_runs_select" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_insert" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_update" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_select_admin" ON audit_runs;

-- Revoke table privileges from client roles.
REVOKE ALL ON TABLE event_logs FROM anon, authenticated;
REVOKE ALL ON TABLE audit_runs FROM anon, authenticated;
