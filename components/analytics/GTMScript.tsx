import Script from 'next/script';

type Props = {
    gtmId: string;
};

export default function GTMScript({ gtmId }: Props) {
    if (!gtmId || !gtmId.startsWith('GTM-')) return null;

    return (
        <>
            {/* GTM Script in <head> */}
            <Script id="gtm-head" strategy="afterInteractive">
                {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
            </Script>
            {/* GTM noscript fallback - injected via dangerouslySetInnerHTML below */}
        </>
    );
}

export function GTMNoscript({ gtmId }: Props) {
    if (!gtmId || !gtmId.startsWith('GTM-')) return null;
    return (
        <noscript>
            <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
            />
        </noscript>
    );
}
