import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';
import { getPublicSiteConfig } from '@features/site-settings/server';
import { localeAlternates, localeOpenGraph, localeTwitter } from '@/i18n/routing';
import { submitLeadInquiryAction } from '@/app/_composition/lead-inquiry-actions';

type Props = {
    params: Promise<{ locale: string }>;
};

// TODO: title/description are Romanian-only regardless of locale — a
// pre-existing gap, not introduced or fixed here.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    const title = 'Contact | SwissCars.md';
    const description = 'Contactează SwissCars pentru orice informație legată de importul sau vânzarea auto din Elveția.';
    return {
        title,
        description,
        alternates: localeAlternates(locale, '/contact'),
        openGraph: localeOpenGraph({ locale, path: '/contact', title, description }),
        twitter: localeTwitter({ title, description }),
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
            submitLeadInquiry={submitLeadInquiryAction}
        />
    );
}
