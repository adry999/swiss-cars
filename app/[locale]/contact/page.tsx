import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';
import { getPublicSiteConfig } from '@features/site-settings/server';
import { localizedPageMetadata } from '@i18n/routing';
import { submitLeadInquiryAction } from '@app/_composition/lead-inquiry-actions';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;
    return localizedPageMetadata({
        locale,
        path: '/contact',
        copyByLocale: {
            ro: { title: 'Contact | SwissCars.md', description: 'Contactează SwissCars pentru orice informație legată de importul sau vânzarea auto din Elveția.' },
            ru: { title: 'Контакты | SwissCars.md', description: 'Свяжитесь со SwissCars по любым вопросам об импорте или продаже автомобилей из Швейцарии.' },
            en: { title: 'Contact | SwissCars.md', description: 'Contact SwissCars about importing or buying a car from Switzerland.' },
        },
    });
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
