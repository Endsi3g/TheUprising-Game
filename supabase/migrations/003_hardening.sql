-- ═══════════════════════════════════════════════════════════════════════════
-- Hardening: Restrict RLS Policies
-- ═══════════════════════════════════════════════════════════════════════════
-- ─── SESSIONS ───────────────────────────────────────────────────────────────
-- Drop permissive public select
DROP POLICY IF EXISTS "sessions_select" ON sessions;
-- Allow Anon to Insert (Kiosk mode)
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
CREATE POLICY "sessions_insert_public" ON sessions FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- Allow Admin (Authenticated) to Select/Update, Block Anon
CREATE POLICY "sessions_select_admin" ON sessions FOR
SELECT TO authenticated USING (true);
CREATE POLICY "sessions_update_admin" ON sessions FOR
UPDATE TO authenticated USING (true);
-- ─── LEADS ──────────────────────────────────────────────────────────────────
-- Drop permissive public select
DROP POLICY IF EXISTS "leads_select" ON leads;
-- Allow Anon to Insert
DROP POLICY IF EXISTS "leads_insert" ON leads;
CREATE POLICY "leads_insert_public" ON leads FOR
INSERT TO anon,
    authenticated WITH CHECK (true);
-- Allow Admin to Select/Update
CREATE POLICY "leads_select_admin" ON leads FOR
SELECT TO authenticated USING (true);
CREATE POLICY "leads_update_admin" ON leads FOR
UPDATE TO authenticated USING (true);
-- ─── AUDIT RUNS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "audit_runs_select" ON audit_runs;
-- Runs are created/updated via API (Service Role), so Policy mostly affects Client Read
-- Block Anon Read
CREATE POLICY "audit_runs_select_admin" ON audit_runs FOR
SELECT TO authenticated USING (true);
-- ─── EVENT LOGS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "event_logs_select" ON event_logs;
CREATE POLICY "event_logs_select_admin" ON event_logs FOR
SELECT TO authenticated USING (true);
-- Allow Anon to Log events
DROP POLICY IF EXISTS "event_logs_insert" ON event_logs;
CREATE POLICY "event_logs_insert_public" ON event_logs FOR
INSERT TO anon,
    authenticated WITH CHECK (true);