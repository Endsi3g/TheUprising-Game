-- Growth features: email follow-ups + checkout event tracking

CREATE TABLE IF NOT EXISTS email_followups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    language TEXT NOT NULL DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
    followup_type TEXT NOT NULL CHECK (followup_type IN ('day1', 'day7')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error')),
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_followups_status_schedule
    ON email_followups(status, scheduled_for);

CREATE UNIQUE INDEX IF NOT EXISTS ux_email_followups_key
    ON email_followups(email, session_id, followup_type);

ALTER TABLE email_followups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_followups_select_admin" ON email_followups;
CREATE POLICY "email_followups_select_admin" ON email_followups
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "email_followups_insert_service" ON email_followups;
CREATE POLICY "email_followups_insert_service" ON email_followups
    FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "email_followups_update_service" ON email_followups;
CREATE POLICY "email_followups_update_service" ON email_followups
    FOR UPDATE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS checkout_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    checkout_session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    amount_total BIGINT NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'cad',
    customer_email TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkout_events_payment_status
    ON checkout_events(payment_status, received_at DESC);

ALTER TABLE checkout_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checkout_events_select_admin" ON checkout_events;
CREATE POLICY "checkout_events_select_admin" ON checkout_events
    FOR SELECT TO authenticated USING (true);
