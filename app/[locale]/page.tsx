import { getLocale } from 'next-intl/server';
import { HeroSlider, DualCTABanner } from '@features/site-settings';
import { FeaturedCarsGrid } from '@features/inventory';
import { listFeaturedCars } from '@features/inventory/server';
import { AboutSection, StatsSection, ServicesSection, ContactBanner, WhyUsAccordion, LeasingSection } from '@features/site-settings/server';
import dynamic from 'next/dynamic';
import { Reveal } from '@shared/ui/Reveal';

const ReviewsSlider = dynamic(() => import('@features/reviews').then((reviewsModule) => reviewsModule.ReviewsSlider), { ssr: true });
const PartnersSlider = dynamic(() => import('@features/partners').then((partnersModule) => partnersModule.PartnersSlider), { ssr: true });

import { listVisibleReviews } from '@features/reviews/server';
import { listVisiblePartners } from '@features/partners/server';
import { getHomepageContent, getPublicSiteConfig } from '@features/site-settings/server';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    // Fetch settings for SEO
    const siteConfig = await getPublicSiteConfig();

    return {
        title: siteConfig.site_title || undefined,
        description: siteConfig.site_description || undefined,
    };
}

export default async function HomePage({ params }: Props) {
    const { locale } = await params;

    // Fetch data from Supabase (server-side)
    const [cars, reviews, partners, homepageData, siteConfig] = await Promise.all([
        listFeaturedCars(),
        listVisibleReviews(),
        listVisiblePartners(),
        getHomepageContent(),
        getPublicSiteConfig()
    ]);
    const phone = siteConfig.phone;

    const schema = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": siteConfig.site_title || "SwissCars.md",
        "url": "https://swisscars.md",
        "logo": siteConfig.logo_url || "https://swisscars.md/media/general/swiss-logo-2-red.png",
        "description": siteConfig.site_description || "",
        "telephone": phone || "",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": siteConfig.address || "",
            "addressCountry": "MD"
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />

            <HeroSlider slides={homepageData?.hero_slides} />

            <Reveal>
                <FeaturedCarsGrid cars={cars} />
            </Reveal>

            <Reveal>
                <AboutSection />
            </Reveal>

            <Reveal>
                <StatsSection />
            </Reveal>

            <Reveal>
                <ServicesSection />
            </Reveal>

            <Reveal>
                <ContactBanner />
            </Reveal>

            <Reveal>
                <WhyUsAccordion />
            </Reveal>

            <Reveal>
                <DualCTABanner phone={phone} />
            </Reveal>

            <Reveal>
                <ReviewsSlider reviews={reviews} locale={locale} />
            </Reveal>

            <Reveal>
                <LeasingSection />
            </Reveal>

            <Reveal>
                <PartnersSlider partners={partners} />
            </Reveal>
        </>
    );
}
