export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

declare global {
    interface Window {
        plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    }
}

export function trackEvent(eventName: string, props?: AnalyticsProps) {
    if (typeof window === 'undefined' || typeof window.plausible !== 'function') {
        return;
    }

    const filteredProps = Object.fromEntries(
        Object.entries(props || {}).filter(([, value]) => value !== undefined)
    );

    window.plausible(eventName, { props: filteredProps });
}
