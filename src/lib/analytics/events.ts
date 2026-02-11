export const SERVER_EVENT_TYPES = [
    'visit.home',
    'audit.started',
    'audit.completed',
    'session.start',
    'session.complete',
    'session.abandon',
    'llm.request',
    'llm.response',
    'llm.error',
    'crawl.start',
    'crawl.done',
    'crawl.error',
    'report.generated',
    'email.sent',
    'email.error',
    'lead.created',
    'badge.unlocked',
    'voice.transcribe',
    'voice.tts',
    'voice.lang_switch',
] as const;

export type ServerEventType = (typeof SERVER_EVENT_TYPES)[number];

export const CLIENT_ANALYTICS_EVENTS = {
    AUDIT_COMPLETED: 'audit_completed',
    AUDIT_STARTED: 'audit_started',
    LEAD_CREATED: 'lead_created',
    VISIT_HOME: 'visit_home',
} as const;

export type ClientAnalyticsEvent =
    (typeof CLIENT_ANALYTICS_EVENTS)[keyof typeof CLIENT_ANALYTICS_EVENTS];

export const FUNNEL_EVENTS = {
    AUDIT_COMPLETED: 'audit.completed',
    AUDIT_STARTED: 'audit.started',
    LEAD_CREATED: 'lead.created',
    VISIT_HOME: 'visit.home',
} as const;
