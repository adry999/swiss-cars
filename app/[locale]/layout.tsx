import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing, localeAlternates } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/ui/Preloader';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import GTMScript, { GTMNoscript } from '@/components/analytics/GTMScript';
import { ToastProvider } from '@/components/ui/Toast';
import { MotionConfig } from 'framer-motion';
import { getPublicSiteConfig } from '@/lib/settings';
import type { Metadata } from 'next';

type Props = {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    const meta: Record<string, { title: string; description: string; keywords: string[] }> = {
        ro: {
            title: 'SwissCars.md - Mașini din Elveția',
            description: 'Dealer autorizat de mașini din Elveția. Importăm automobile premium verificate cu istoric complet și garanție.',
            keywords: ['mașini din Elveția', 'auto import Moldova', 'dealer auto', 'mașini premium', 'SwissCars'],
        },
        ru: {
            title: 'SwissCars.md - Автомобили из Швейцарии',
            description: 'Авторизованный дилер автомобилей из Швейцарии. Импортируем премиум автомобили с полной историей и гарантией.',
            keywords: ['автомобили из Швейцарии', 'импорт авто', 'дилер авто', 'премиум авто', 'SwissCars'],
        },
        en: {
            title: 'SwissCars.md - Cars from Switzerland',
            description: 'Authorized car dealer from Switzerland. We import premium cars with full history and warranty.',
            keywords: ['cars from Switzerland', 'car import', 'car dealer', 'premium cars', 'SwissCars'],
        },
    };

    const current = meta[locale] || meta.ro;
    const localeMap: Record<string, string> = { ro: 'ro_RO', ru: 'ru_RU', en: 'en_US' };

    return {
        title: {
            default: current.title,
            template: '%s | SwissCars.md',
        },
        description: current.description,
        keywords: current.keywords,
        alternates: localeAlternates(locale),
        openGraph: {
            siteName: 'SwissCars.md',
            locale: localeMap[locale] || 'ro_RO',
            title: current.title,
            description: current.description,
            images: ['/media/general/swiss-logo-2-red.png'],
        },
    };
}

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    let messages;
    try {
        messages = (await import(`@/messages/${locale}.json`)).default;
    } catch {
        notFound();
    }

    // Public config only — this object is serialized into the RSC payload the
    // moment it reaches a client component such as <Footer>.
    const settings = await getPublicSiteConfig();
    const gtmId = settings.gtm_id || '';

    // No <html>/<body> here — app/layout.tsx (the actual root layout) owns
    // the only one in the tree and sets lang from getLocale(), which reads
    // the same locale this layout resolves via params. Rendering a second
    // <html> here used to get silently dropped by the browser, so the outer
    // (always "ro") one was the only one assistive tech and crawlers saw —
    // Russian and English pages were announced as Romanian regardless of
    // their actual content.
    return (
        <>
            {gtmId && <GTMScript gtmId={gtmId} />}
            {/* reducedMotion="user" makes every framer-motion animation in the
                tree respect prefers-reduced-motion automatically. */}
            <MotionConfig reducedMotion="user">
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ToastProvider>
                        <Preloader />
                        <Header
                            logoUrl={settings.logo_url}
                            logoHeight={settings.logo_height}
                            phone={settings.phone}
                        />
                        <main>{children}</main>
                        <Footer settings={settings} />
                        <WhatsAppFloat phone={settings.whatsapp || settings.phone} />
                    </ToastProvider>
                </NextIntlClientProvider>
            </MotionConfig>
            {gtmId && <GTMNoscript gtmId={gtmId} />}
            <GoogleAnalytics />
        </>
    );
}
