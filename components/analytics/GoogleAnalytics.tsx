import Script from 'next/script';
import { getPublicEnvironment } from '@config/public-environment';

const isValidMeasurementId = (id: string) => /^(G|UA|AW|GT)-[A-Z0-9-]+$/i.test(id);

export default function GoogleAnalytics() {
    const GA_ID = getPublicEnvironment().googleAnalyticsMeasurementId;
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
