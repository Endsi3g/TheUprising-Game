-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 004: Tenant-Scoped RLS Policies
-- Replace permissive "USING (true)" with tenant_id checks from JWT claims.
-- Requires: users must have app_metadata.tenant_id set on creation.
-- ═══════════════════════════════════════════════════════════════════════════

-- Helper function to extract tenant_id from JWT
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'tenant_id',
    ''
  );
$$;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
$$;

-- ─── SESSIONS ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "sessions_select_admin" ON sessions;
DROP POLICY IF EXISTS "sessions_update_admin" ON sessions;

-- Admins can see all, regular users only their tenant
CREATE POLICY "sessions_select_scoped" ON sessions FOR SELECT TO authenticated
  USING (auth.is_admin() OR tenant_id = auth.tenant_id());

CREATE POLICY "sessions_update_scoped" ON sessions FOR UPDATE TO authenticated
  USING (auth.is_admin() OR tenant_id = auth.tenant_id());

-- ─── LEADS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "leads_select_admin" ON leads;
DROP POLICY IF EXISTS "leads_update_admin" ON leads;

CREATE POLICY "leads_select_scoped" ON leads FOR SELECT TO authenticated
  USING (auth.is_admin() OR tenant_id = auth.tenant_id());

CREATE POLICY "leads_update_scoped" ON leads FOR UPDATE TO authenticated
  USING (auth.is_admin() OR tenant_id = auth.tenant_id());

-- ─── AUDIT RUNS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "audit_runs_select_admin" ON audit_runs;

CREATE POLICY "audit_runs_select_scoped" ON audit_runs FOR SELECT TO authenticated
  USING (auth.is_admin() OR session_id IN (
    SELECT id FROM sessions WHERE tenant_id = auth.tenant_id()
  ));

-- ─── EVENT LOGS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "event_logs_select_admin" ON event_logs;

CREATE POLICY "event_logs_select_scoped" ON event_logs FOR SELECT TO authenticated
  USING (auth.is_admin() OR tenant_id = auth.tenant_id());
