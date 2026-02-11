-- ═══════════════════════════════════════════════════════════════════════════
-- Salon AI – Complete Consolidated Schema
-- Run this in the Supabase SQL Editor to fix missing tables and permissions.
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- 2. Create Tables
-- TENANTS
CREATE TABLE IF NOT EXISTS tenants (
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
    voice_config JSONB DEFAULT NULL,
    upsell_packs JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
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
-- SESSIONS
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('startup', 'portfolio', 'audit')),
    niche TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    raw_input_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    report_json JSONB,
    gamification_json JSONB,
    duration_ms BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);
-- LEADS
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    -- Made nullable in 006
    first_name TEXT NOT NULL,
    email TEXT NOT NULL,
    sector TEXT NOT NULL,
    site_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- AUDIT RUNS
CREATE TABLE IF NOT EXISTS audit_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    html_summary TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- EVENT LOGS
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE
    SET NULL,
        event_type TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- CATALOGUE ITEMS (Missing from previous migrations)
CREATE TABLE IF NOT EXISTS catalogue_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    url TEXT NOT NULL,
    tags TEXT [],
    date TIMESTAMPTZ,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- 3. Create Indexes
CREATE INDEX IF NOT EXISTS idx_templates_tenant ON templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_templates_mode_niche ON templates(mode, niche, language);
CREATE INDEX IF NOT EXISTS idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_session_email_unique ON leads(session_id, email)
WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_runs_session ON audit_runs(session_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_tenant ON event_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_session ON event_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_created ON event_logs(created_at DESC);
-- 4. Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogue_items ENABLE ROW LEVEL SECURITY;
-- 5. Create Policies (Hardened)
-- Tenants: Public Read
DROP POLICY IF EXISTS "tenants_read" ON tenants;
CREATE POLICY "tenants_read" ON tenants FOR
SELECT USING (true);
-- Templates: Public Read
DROP POLICY IF EXISTS "templates_read" ON templates;
CREATE POLICY "templates_read" ON templates FOR
SELECT USING (true);
-- Catalogue: Public Read
DROP POLICY IF EXISTS "catalogue_items_read" ON catalogue_items;
CREATE POLICY "catalogue_items_read" ON catalogue_items FOR
SELECT USING (true);
-- Sessions: Private (Service Role only)
DROP POLICY IF EXISTS "sessions_select" ON sessions;
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
DROP POLICY IF EXISTS "sessions_update" ON sessions;
DROP POLICY IF EXISTS "sessions_delete" ON sessions;
REVOKE ALL ON TABLE sessions
FROM anon,
    authenticated;
-- Leads: Private (Service Role only)
DROP POLICY IF EXISTS "leads_select" ON leads;
DROP POLICY IF EXISTS "leads_insert" ON leads;
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_delete" ON leads;
REVOKE ALL ON TABLE leads
FROM anon,
    authenticated;
-- Audit Runs: Private (Service Role only)
DROP POLICY IF EXISTS "audit_runs_select" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_insert" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_update" ON audit_runs;
DROP POLICY IF EXISTS "audit_runs_delete" ON audit_runs;
REVOKE ALL ON TABLE audit_runs
FROM anon,
    authenticated;
-- Event Logs: Private (Service Role only)
DROP POLICY IF EXISTS "event_logs_select" ON event_logs;
DROP POLICY IF EXISTS "event_logs_insert" ON event_logs;
DROP POLICY IF EXISTS "event_logs_update" ON event_logs;
DROP POLICY IF EXISTS "event_logs_delete" ON event_logs;
REVOKE ALL ON TABLE event_logs
FROM anon,
    authenticated;
-- 6. Seed Data (Upsert to avoid duplicates)
INSERT INTO tenants (
        id,
        name,
        subdomain,
        primary_sector,
        branding,
        framer_gallery_urls,
        voice_config
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
        '{}'::jsonb,
        '{
        "voice_style": "friendly",
        "copy_tone": {
            "formality": "tu",
            "guidelines": "Sois chaleureux et direct. Utilise des exemples concrets québécois.",
            "sample_phrases": ["Parfait, super bon point!", "On va te bâtir un plan solide!", "Ça a du potentiel, on continue!"]
        }
    }'::jsonb
    ) ON CONFLICT (id) DO
UPDATE
SET voice_config = EXCLUDED.voice_config;
-- 7. Triggers
CREATE OR REPLACE FUNCTION set_leads_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at BEFORE
UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION set_leads_updated_at();