import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/ui/Preloader';
import WhatsAppFloat from '@/components/ui/WhatsAppFloat';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import GTMScript, { GTMNoscript } from '@/components/analytics/GTMScript';
import { ToastProvider } from '@/components/ui/Toast';
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

    const { getSettings } = await import('@/lib/actions/settings');
    const settings = await getSettings('site_config') || {};
    const gtmId: string = (settings as any)?.gtm_id || '';

return (
        <html lang={locale} suppressHydrationWarning>
            <body suppressHydrationWarning>
                {gtmId && <GTMScript gtmId={gtmId} />}
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ToastProvider>
                        <Preloader />
                        <Header
                            logoUrl={(settings as any)?.logo_url}
                            logoHeight={(settings as any)?.logo_height}
                            phone={(settings as any)?.phone}
                        />
                        <main>{children}</main>
                        <Footer settings={settings} />
                        <WhatsAppFloat phone={(settings as any)?.whatsapp || (settings as any)?.phone} />
                    </ToastProvider>
                </NextIntlClientProvider>
                {gtmId && <GTMNoscript gtmId={gtmId} />}
                <GoogleAnalytics />
            </body>
        </html>
    );
}
