-- ═══════════════════════════════════════════════════════════════════════════
-- Phase 2 – Gamification, Voice Config, Event Logs, Upsells
-- ═══════════════════════════════════════════════════════════════════════════
-- ─── Sessions: add gamification + duration ─────────────────────────────────
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS gamification_json JSONB;
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS duration_ms BIGINT;
-- ─── Tenants: add voice config + upsell packs ──────────────────────────────
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS voice_config JSONB DEFAULT NULL;
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS upsell_packs JSONB NOT NULL DEFAULT '[]'::jsonb;
-- ─── Event Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE
    SET NULL,
        event_type TEXT NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_logs_tenant ON event_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_session ON event_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_event_logs_type ON event_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_event_logs_created ON event_logs(created_at DESC);
-- RLS
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_logs_select" ON event_logs FOR
SELECT USING (true);
CREATE POLICY "event_logs_insert" ON event_logs FOR
INSERT WITH CHECK (true);
-- ─── Update demo tenant with defaults ───────────────────────────────────────
UPDATE tenants
SET voice_config = '{
  "voice_style": "friendly",
  "copy_tone": {
    "formality": "tu",
    "guidelines": "Sois chaleureux et direct. Utilise des exemples concrets québécois.",
    "sample_phrases": ["Parfait, super bon point!", "On va te bâtir un plan solide!", "Ça a du potentiel, on continue!"]
  }
}'::jsonb,
    upsell_packs = '[]'::jsonb
WHERE id = '00000000-0000-0000-0000-000000000001';