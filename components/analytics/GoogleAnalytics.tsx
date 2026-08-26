import Script from 'next/script';

// The documented name is NEXT_PUBLIC_GA_MEASUREMENT_ID (README, DEPLOYMENT.md,
// CLAUDE.md). This file previously read NEXT_PUBLIC_GA_ID only, so analytics
// silently never loaded for anyone who configured it as documented. Both are
// accepted so existing deployments keep working.
const GA_ID =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;

const isValidMeasurementId = (id: string) => /^(G|UA|AW|GT)-[A-Z0-9-]+$/i.test(id);

export default function GoogleAnalytics() {
    if (!GA_ID || !isValidMeasurementId(GA_ID)) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', ${JSON.stringify(GA_ID)}, {
                        page_path: window.location.pathname,
                    });
                `}
            </Script>
        </>
    );
}
