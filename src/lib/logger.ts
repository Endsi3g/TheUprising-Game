import type { EventType } from '@/types/database';
import { createServiceClient } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LogEvent {
    event_type: EventType;
    tenant_id: string;
    session_id?: string;
    metadata?: Record<string, unknown>;
}

// ─── Structured Logger ────────────────────────────────────────────────────────

/**
 * Log a structured event to both console and Supabase event_logs table.
 * Non-blocking — failures are caught and logged to console only.
 */
export async function logEvent(event: LogEvent): Promise<void> {
    const timestamp = new Date().toISOString();

    // Always log to console (structured JSON for log aggregation)
    console.log(
        JSON.stringify({
            level: event.event_type.includes('error') ? 'error' : 'info',
            event: event.event_type,
            tenant_id: event.tenant_id,
            session_id: event.session_id || null,
            metadata: event.metadata || {},
            timestamp,
        })
    );

    // Persist to DB (non-blocking)
    try {
        const supabase = createServiceClient();
        await supabase.from('event_logs').insert({
            tenant_id: event.tenant_id,
            session_id: event.session_id || null,
            event_type: event.event_type,
            metadata: event.metadata || {},
        });
    } catch (err) {
        console.error('[Logger] Failed to persist event:', err);
    }
}

// ─── Convenience Helpers ──────────────────────────────────────────────────────

export function logSessionStart(tenantId: string, sessionId: string, mode: string, niche: string) {
    return logEvent({
        event_type: 'session.start',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { mode, niche },
    });
}

export function logSessionComplete(tenantId: string, sessionId: string, durationMs: number) {
    return logEvent({
        event_type: 'session.complete',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { duration_ms: durationMs },
    });
}

export function logLLMRequest(tenantId: string, sessionId: string, provider: string) {
    return logEvent({
        event_type: 'llm.request',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { provider, started_at: Date.now() },
    });
}

export function logLLMResponse(tenantId: string, sessionId: string, provider: string, latencyMs: number) {
    return logEvent({
        event_type: 'llm.response',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { provider, latency_ms: latencyMs },
    });
}

export function logLLMError(tenantId: string, sessionId: string, provider: string, error: string) {
    return logEvent({
        event_type: 'llm.error',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { provider, error },
    });
}

export function logCrawl(tenantId: string, sessionId: string, url: string, status: 'start' | 'done' | 'error', extra?: Record<string, unknown>) {
    const eventType = `crawl.${status}` as EventType;
    return logEvent({
        event_type: eventType,
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { url, ...extra },
    });
}

export function logReportGenerated(tenantId: string, sessionId: string, durationMs: number, score: number) {
    return logEvent({
        event_type: 'report.generated',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { duration_ms: durationMs, score },
    });
}

export function logEmail(tenantId: string, sessionId: string, status: 'sent' | 'error', extra?: Record<string, unknown>) {
    const eventType = status === 'sent' ? 'email.sent' : 'email.error';
    return logEvent({
        event_type: eventType as EventType,
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: extra,
    });
}

export function logBadgeUnlocked(tenantId: string, sessionId: string, badgeType: string) {
    return logEvent({
        event_type: 'badge.unlocked',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { badge_type: badgeType },
    });
}

export function logLeadCreated(tenantId: string, sessionId: string, email: string) {
    return logEvent({
        event_type: 'lead.created',
        tenant_id: tenantId,
        session_id: sessionId,
        metadata: { email_hash: email.substring(0, 3) + '***' },
    });
}
