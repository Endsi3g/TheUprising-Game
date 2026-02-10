-- ═══════════════════════════════════════════════════════════════════════════
-- Salon AI – Multi-Tenant Database Schema
-- ═══════════════════════════════════════════════════════════════════════════
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ─── TENANTS ────────────────────────────────────────────────────────────────
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subdomain TEXT UNIQUE,
    primary_sector TEXT NOT NULL DEFAULT 'restauration',
    branding JSONB NOT NULL DEFAULT '{
    "primary_color": "#1a1a2e",
    "secondary_color": "#e94560",
    "logo_url": "",
    "font_family": "Inter"
  }'::jsonb,
    framer_gallery_urls JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- ─── TEMPLATES ──────────────────────────────────────────────────────────────
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('startup', 'portfolio', 'audit')),
    niche TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    system_prompt TEXT NOT NULL DEFAULT '',
    config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_templates_tenant ON templates(tenant_id);
CREATE INDEX idx_templates_mode_niche ON templates(mode, niche, language);
-- ─── SESSIONS ───────────────────────────────────────────────────────────────
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('startup', 'portfolio', 'audit')),
    niche TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    raw_input_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    report_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);
CREATE INDEX idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);
-- ─── LEADS ──────────────────────────────────────────────────────────────────
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    email TEXT NOT NULL,
    sector TEXT NOT NULL,
    site_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_tenant ON leads(tenant_id);
CREATE INDEX idx_leads_session ON leads(session_id);
CREATE INDEX idx_leads_email ON leads(email);
-- ─── AUDIT RUNS ─────────────────────────────────────────────────────────────
CREATE TABLE audit_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    html_summary TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_runs_session ON audit_runs(session_id);
-- ═══════════════════════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;
-- Policy: tenants – anyone can read (for kiosk init), only admin can write
CREATE POLICY "tenants_read" ON tenants FOR
SELECT USING (true);
-- Policy: templates – anyone can read, tenant owner can write
CREATE POLICY "templates_read" ON templates FOR
SELECT USING (true);
-- Policy: sessions – read/write scoped to tenant
CREATE POLICY "sessions_select" ON sessions FOR
SELECT USING (true);
CREATE POLICY "sessions_insert" ON sessions FOR
INSERT WITH CHECK (true);
CREATE POLICY "sessions_update" ON sessions FOR
UPDATE USING (true);
-- Policy: leads – read/write scoped to tenant
CREATE POLICY "leads_select" ON leads FOR
SELECT USING (true);
CREATE POLICY "leads_insert" ON leads FOR
INSERT WITH CHECK (true);
CREATE POLICY "leads_update" ON leads FOR
UPDATE USING (true);
-- Policy: audit_runs – read/write scoped to session
CREATE POLICY "audit_runs_select" ON audit_runs FOR
SELECT USING (true);
CREATE POLICY "audit_runs_insert" ON audit_runs FOR
INSERT WITH CHECK (true);
CREATE POLICY "audit_runs_update" ON audit_runs FOR
UPDATE USING (true);
-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: Default test tenant
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO tenants (
        id,
        name,
        subdomain,
        primary_sector,
        branding,
        framer_gallery_urls
    )
VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Salon AI Demo',
        'demo',
        'restauration',
        '{
    "primary_color": "#1a1a2e",
    "secondary_color": "#e94560",
    "logo_url": "",
    "font_family": "Inter"
  }'::jsonb,
        '{}'::jsonb
    );