'use client';

import { useEffect } from 'react';
import { trackAnalyticsEvent, trackServerEvent } from '@/lib/analytics-client';
import { CLIENT_ANALYTICS_EVENTS, FUNNEL_EVENTS } from '@/lib/analytics/events';

export function TrackHomeVisit() {
    useEffect(() => {
        trackAnalyticsEvent(CLIENT_ANALYTICS_EVENTS.VISIT_HOME, { page: 'home' });
        trackServerEvent(FUNNEL_EVENTS.VISIT_HOME, {
            metadata: {
                page: '/',
                referrer: document.referrer || 'direct',
            },
        });
    }, []);

    return null;
}
