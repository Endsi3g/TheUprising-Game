'use client';

import type { ClientAnalyticsEvent, ServerEventType } from '@/lib/analytics/events';

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    }
}

type EventProps = Record<string, string | number | boolean>;

export function trackAnalyticsEvent(eventName: ClientAnalyticsEvent | string, props: EventProps = {}) {
    if (typeof window === 'undefined') return;

    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, props);
    }

    if (typeof window.plausible === 'function') {
        window.plausible(eventName, { props });
    }
}

export function trackServerEvent(
    eventType: ServerEventType,
    payload: { sessionId?: string; metadata?: Record<string, unknown> } = {}
) {
    if (typeof window === 'undefined') return;

    const body = JSON.stringify({
        eventType,
        sessionId: payload.sessionId,
        metadata: payload.metadata || {},
    });

    if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/event', blob);
        return;
    }

    void fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
    });
}
