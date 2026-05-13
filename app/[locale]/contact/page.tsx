import type { Metadata } from 'next';
import ContactPageClient from '@/components/contact/ContactPageClient';
import { getSettings } from '@/lib/actions/settings';

export const metadata: Metadata = {
    title: 'Contact | SwissCars.md',
    description: 'Contactează SwissCars pentru orice informație legată de importul sau vânzarea auto din Elveția.',
};

export default async function ContactPage() {
    const siteConfig = (await getSettings('site_config') || {}) as any;

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
