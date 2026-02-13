import Script from 'next/script';

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SCRIPT_SRC =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC || 'https://plausible.io/js/script.js';

export function AnalyticsScripts() {
    if (!GA4_MEASUREMENT_ID && !PLAUSIBLE_DOMAIN) {
        return null;
    }

    return (
        <>
            {GA4_MEASUREMENT_ID && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: true });
                        `}
                    </Script>
                </>
            )}
            {PLAUSIBLE_DOMAIN && (
                <Script
                    src={PLAUSIBLE_SCRIPT_SRC}
                    data-domain={PLAUSIBLE_DOMAIN}
                    strategy="afterInteractive"
                    defer
                />
            )}
        </>
    );
}
