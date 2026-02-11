-- ============================================================================
-- 006_leads_contact_alignment.sql
-- Align leads schema with API usage (contact + upsert workflows).
-- ============================================================================

-- Contact-form leads are not always tied to a session.
ALTER TABLE leads ALTER COLUMN session_id DROP NOT NULL;

-- Keep update timestamps for upsert/update analytics.
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

UPDATE leads
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Ensure one lead per (session, email) when a session exists.
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_session_email_unique
ON leads(session_id, email)
WHERE session_id IS NOT NULL;

CREATE OR REPLACE FUNCTION set_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON leads;
CREATE TRIGGER trg_leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION set_leads_updated_at();
