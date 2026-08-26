import type { Metadata } from 'next';
import ContactPageClient from '@/components/contact/ContactPageClient';
import { getPublicSiteConfig } from '@/lib/settings';
import { localeAlternates } from '@/i18n/routing';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: 'Contact | SwissCars.md',
        description: 'Contactează SwissCars pentru orice informație legată de importul sau vânzarea auto din Elveția.',
        alternates: localeAlternates(locale, '/contact'),
    };
}

export default async function ContactPage() {
    const siteConfig = await getPublicSiteConfig();

    return (
        <ContactPageClient
            phoneNumber={siteConfig.phone}
            whatsapp={siteConfig.whatsapp}
            emailAddress={siteConfig.email}
            address={siteConfig.address}
            workingHours={siteConfig.working_hours}
            workingDaysClosed={siteConfig.working_days_closed}
            googleMapsEmbed={siteConfig.google_maps_embed}
        />
    );
}
