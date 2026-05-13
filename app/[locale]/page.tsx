import { getLocale } from 'next-intl/server';
import HeroSlider from '@/components/home/HeroSlider';
import CarsGrid from '@/components/home/CarsGrid';
import AboutSection from '@/components/home/AboutSection';
import StatsSection from '@/components/home/StatsSection';
import ServicesSection from '@/components/home/ServicesSection';
import ContactBanner from '@/components/home/ContactBanner';
import WhyUsAccordion from '@/components/home/WhyUsAccordion';
import dynamic from 'next/dynamic';
import DualCTABanner from '@/components/home/DualCTABanner';
import LeasingSection from '@/components/home/LeasingSection';
import { Reveal } from '@/components/ui/Reveal';

const ReviewsSlider = dynamic(() => import('@/components/home/ReviewsSlider'), { ssr: true });
const PartnersSlider = dynamic(() => import('@/components/home/PartnersSlider'), { ssr: true });

import { getFeaturedCars, getReviews, getPartners } from '@/lib/supabase/queries';
import { getSettings } from '@/lib/actions/settings';
import type { Metadata } from 'next';

type Props = {
    params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { locale } = await params;

    // Fetch settings for SEO
    const siteConfig = await getSettings('site_config') || {};

    return {
        title: siteConfig.site_title || undefined,
        description: siteConfig.site_description || undefined,
    };
}

export default async function HomePage({ params }: Props) {
    const { locale } = await params;

    // Fetch data from Supabase (server-side)
    const [cars, reviews, partners, homepageData, siteConfig] = await Promise.all([
        getFeaturedCars(),
        getReviews(),
        getPartners(),
        getSettings('homepage_content'),
        getSettings('site_config')
    ]);
    const phone = (siteConfig as any)?.phone;

    const schema = {
        "@context": "https://schema.org",
        "@type": "AutoDealer",
        "name": siteConfig.site_title || "SwissCars.md",
        "url": "https://swisscars.md",
        "logo": (siteConfig as any)?.logo_url || "https://swisscars.md/media/general/swiss-logo-2-red.png",
        "description": siteConfig.site_description || "",
        "telephone": phone || "",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": (siteConfig as any)?.address || "",
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
                <CarsGrid cars={cars} />
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
