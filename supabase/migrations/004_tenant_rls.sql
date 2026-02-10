-- ═══════════════════════════════════════════════════════════════════════════
-- 004_tenant_rls.sql
-- Lock down sensitive tables to prevent public/anonymous access.
-- Access should be mediated via API routes using Service Role.
-- ═══════════════════════════════════════════════════════════════════════════
-- ─── SESSIONS ───────────────────────────────────────────────────────────────
-- Drop existing permissive policies
DROP POLICY IF EXISTS "sessions_select" ON sessions;
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
DROP POLICY IF EXISTS "sessions_update" ON sessions;
DROP POLICY IF EXISTS "sessions_delete" ON sessions;
-- Explicitly allow Service Role (redundant as it bypasses, but good for clarity)
-- Note: Service Role bypasses RLS automatically, so no policy needed strictly.
-- But we ensure no public policy exists.
-- ─── LEADS ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_insert" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_delete" ON leads;
-- ─── AUDIT RUNS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "audit_runs_select" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_insert" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_update" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_delete" ON audit_runs;
-- ─── TEMPLATES ──────────────────────────────────────────────────────────────
-- Templates might be public, but check if we want to restrict write/update
-- Existing 001:
-- CREATE POLICY "templates_read" ON templates FOR SELECT USING (true);
-- Write is restricted to tenant owner in theory, but 001 didn't create write policies for templates explicitly?
-- schema says: "tenant owner can write" comment, but no code.
-- We leave read access open for now (branding/config).
-- ─── TENANTS ────────────────────────────────────────────────────────────────
-- Tenants public read is required for resolving branding by subdomain.
-- Existing 001:
-- CREATE POLICY "tenants_read" ON tenants FOR SELECT USING (true);
-- Create explicit deny for public write if not already default (default is deny if RLS on and no policy matches).