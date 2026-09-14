import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { findCarBySlug, listCarSlugs, SimilarCars } from '@features/inventory/server';
import { getPublicSiteConfig } from '@features/site-settings/server';
import { routing, localeAlternates, localeUrl, localeOpenGraph, localeTwitter, withSiteName } from '@i18n/routing';
import { sanitizeHtml } from '@shared/formatting/sanitize';
import { formatPrice } from '@shared/formatting/format';
import { Link } from '@i18n/navigation';
import { FileCheck, Shield, BadgeCheck, HeadphonesIcon, Calculator } from 'lucide-react';
import { CarGallery, CarSpecsGrid, FavoriteButton } from '@features/inventory';
import { CarInquiryForm } from '@features/leads';
import { submitLeadInquiryAction } from '@app/_composition/lead-inquiry-actions';
import styles from './page.module.css';

type Props = {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
};

// Pre-render all car pages at build time for better SEO
export async function generateStaticParams() {
    const slugs = await listCarSlugs();

    const params: { locale: string; slug: string }[] = [];

    for (const locale of routing.locales) {
        for (const slug of slugs) {
            params.push({ locale, slug });
        }
    }

    return params;
}

export async function generateMetadata({ params }: Props) {
    const { locale, slug } = await params;
    const car = await findCarBySlug(slug);
    if (!car) return {};
    const primaryImage = car.car_images?.find((img) => img.is_primary) || car.car_images?.[0];
    const title = `${car.brand} ${car.model} ${car.year}${car.is_available ? '' : ' (Vândut)'}`;
    const description = `${car.brand} ${car.model} ${car.year} — ${car.is_available ? `${formatPrice(car.price)} €` : 'Vândut'}. Import auto din Elveția.`;

    return {
        title,
        description,
        alternates: localeAlternates(locale, `/inventory/${slug}`),
        // A page's openGraph replaces the layout's instead of merging, so title and description are set here too.
        openGraph: localeOpenGraph({
            locale,
            path: `/inventory/${slug}`,
            title: withSiteName(title),
            description,
            image: primaryImage?.url,
        }),
        twitter: localeTwitter({ title: withSiteName(title), description, image: primaryImage?.url }),
    };
}

export default async function CarDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    const [car, siteConfig] = await Promise.all([
        findCarBySlug(slug),
        getPublicSiteConfig(),
    ]);
    const t = await getTranslations('car_detail');

    if (!car) notFound();

    const config = siteConfig;

    const getTranslatedDescription = () => {
        if (!car.description) return '';
        if (typeof car.description === 'string') return car.description;
        const desc = car.description;

        // Try current locale first, then fallback to 'ro', finally any available language
        const currentDesc = desc[locale];
        if (currentDesc && currentDesc.trim().length > 0) return currentDesc;

        const roDesc = desc['ro'];
        if (roDesc && roDesc.trim().length > 0) return roDesc;

        // Last resort: any non-empty string in the description object
        return Object.values(desc).find(v => typeof v === 'string' && v.trim().length > 0) as string || '';
    };

    const schema = {
        "@context": "https://schema.org",
        "@type": "Vehicle",
        "name": `${car.brand} ${car.model} ${car.year}`,
        "image": car.car_images?.map((img) => img.url) || [],
        "brand": {
            "@type": "Brand",
            "name": car.brand
        },
        "manufacturer": {
            "@type": "Organization",
            "name": car.brand
        },
        "model": car.model,
        "vehicleModelDate": String(car.year),
        "mileageFromOdometer": {
            "@type": "QuantitativeValue",
            "value": car.mileage || 0,
            "unitCode": "KMT"
        },
        "fuelType": car.fuel_type || "",
        "vehicleTransmission": car.transmission || "",
        "offers": {
            "@type": "Offer",
            "priceCurrency": "EUR",
            "price": car.price,
            "itemCondition": "https://schema.org/UsedCondition",
            "availability": car.is_available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            // localePrefix is as-needed: /ro/... does not exist.
            "url": localeUrl(locale, `/inventory/${car.slug}`)
        }
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": t('breadcrumb_home'),
                "item": localeUrl(locale, "/")
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": t('breadcrumb_inventory'),
                "item": localeUrl(locale, "/inventory")
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": `${car.brand} ${car.model}`,
                "item": localeUrl(locale, `/inventory/${car.slug}`)
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <main className={styles.main}>
                {/* Breadcrumb Header */}
                <div className={styles.premiumHeader}>
                    <div className="container">
                        <div className={styles.breadcrumb}>
                            <Link href="/">{t('breadcrumb_home')}</Link> / <Link href="/inventory">{t('breadcrumb_inventory')}</Link> / {car.brand} {car.model}
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className={styles.layout}>
                        {/* Left: Gallery + Specs */}
                        <div className={styles.content}>
                            <CarGallery images={car.car_images || []} />

                            {/* Mobile-only Sidebar Content */}
                            <div className={styles.sidebarMobile}>
                                {/* Price Card */}
                                <div className={styles.card}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                        <div>
                                            <h1 className={styles.title}>{car.brand} {car.model}</h1>
                                            <div className={styles.year}>{car.year}</div>
                                        </div>
                                        <FavoriteButton carId={car.id ?? ''} carName={`${car.brand} ${car.model}`} />
                                    </div>

                                    <div className={styles.priceWrapper}>
                                        <span className={styles.priceLabel}>{t('price')}</span>
                                        <div className={`${styles.price} ${!car.is_available ? styles.soldText : ''}`}>
                                            {car.is_available ? `${formatPrice(car.price)} €` : t('sold')}
                                        </div>
                                        {car.is_available && <div className={styles.taxes}>{t('taxes_included')}</div>}
                                    </div>
                                </div>

                                {/* Lead Contact Form */}
                                <div className={styles.card}>
                                    <h3 className={styles.contactTitle}>{t('contact_sidebar_title')}</h3>
                                    <p className={styles.contactSubtitle}>{t('contact_sidebar_subtitle')}</p>
                                    <CarInquiryForm
                                        carId={car.id ?? ''}
                                        carTitle={`${car.brand} ${car.model} ${car.year}`}
                                        carPrice={car.price}
                                        phoneNumber={config.phone}
                                        whatsappNumber={config.whatsapp}
                                        submitLeadInquiry={submitLeadInquiryAction}
                                    />
                                </div>
                            </div>

                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>{t('characteristics')}</h2>
                                <CarSpecsGrid car={car} />
                            </section>

                            {getTranslatedDescription() && (
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>{t('general_info')}</h2>
                                    <div
                                        className={styles.description}
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(getTranslatedDescription()) }}
                                    />
                                </section>
                            )}

                            {/* Why Us Section */}
                            <section className={styles.section}>
                                <h2 className={styles.sectionTitle}>{t('why_us_title')}</h2>
                                <div className={styles.whyUsGrid}>
                                    <div className={styles.whyUsItem}>
                                        <div className={styles.whyUsIcon}>
                                            <FileCheck size={28} />
                                        </div>
                                        <div>
                                            <h4>{t('why_us_1_title')}</h4>
                                            <p>{t('why_us_1_text')}</p>
                                        </div>
                                    </div>
                                    <div className={styles.whyUsItem}>
                                        <div className={styles.whyUsIcon}>
                                            <Shield size={28} />
                                        </div>
                                        <div>
                                            <h4>{t('why_us_2_title')}</h4>
                                            <p>{t('why_us_2_text')}</p>
                                        </div>
                                    </div>
                                    <div className={styles.whyUsItem}>
                                        <div className={styles.whyUsIcon}>
                                            <BadgeCheck size={28} />
                                        </div>
                                        <div>
                                            <h4>{t('why_us_3_title')}</h4>
                                            <p>{t('why_us_3_text')}</p>
                                        </div>
                                    </div>
                                    <div className={styles.whyUsItem}>
                                        <div className={styles.whyUsIcon}>
                                            <HeadphonesIcon size={28} />
                                        </div>
                                        <div>
                                            <h4>{t('why_us_4_title')}</h4>
                                            <p>{t('why_us_4_text')}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Leasing Teaser */}
                            <section className={styles.leasingTeaser}>
                                <div className={styles.leasingIcon}>
                                    <Calculator size={32} />
                                </div>
                                <div className={styles.leasingContent}>
                                    <h3>{t('leasing_title')}</h3>
                                    <p>{t('leasing_text')}</p>
                                </div>
                                <Link href="/leasing" className={`btn btn-primary ${styles.leasingBtn}`}>
                                    {t('leasing_cta')}
                                </Link>
                            </section>
                        </div>

                        {/* Right: Sidebar */}
                        <aside className={`${styles.sidebar} ${styles.sidebarDesktop}`}>
                            <div className={styles.sticky}>
                                {/* Price Card */}
                                <div className={styles.card}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                                        <div>
                                            <h1 className={styles.title}>{car.brand} {car.model}</h1>
                                            <div className={styles.year}>{car.year}</div>
                                        </div>
                                        <FavoriteButton carId={car.id ?? ''} carName={`${car.brand} ${car.model}`} />
                                    </div>

                                    <div className={styles.priceWrapper}>
                                        <span className={styles.priceLabel}>{t('price')}</span>
                                        <div className={`${styles.price} ${!car.is_available ? styles.soldText : ''}`}>
                                            {car.is_available ? `${formatPrice(car.price)} €` : t('sold')}
                                        </div>
                                        {car.is_available && <div className={styles.taxes}>{t('taxes_included')}</div>}
                                    </div>
                                </div>

                                {/* Lead Contact Form */}
                                <div className={styles.card}>
                                    <h3 className={styles.contactTitle}>{t('contact_sidebar_title')}</h3>
                                    <p className={styles.contactSubtitle}>{t('contact_sidebar_subtitle')}</p>
                                    <CarInquiryForm
                                        carId={car.id ?? ''}
                                        carTitle={`${car.brand} ${car.model} ${car.year}`}
                                        carPrice={car.price}
                                        phoneNumber={config.phone}
                                        whatsappNumber={config.whatsapp}
                                        submitLeadInquiry={submitLeadInquiryAction}
                                    />
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Bottom Contact Form Banner */}
                <div className={styles.bottomContactBanner}>
                    <div className="container">
                        <div className={styles.bottomContactInner}>
                            <div className={styles.bottomContactText}>
                                <h2>{t('interested_title')}</h2>
                                <p>{t('interested_text')}</p>
                            </div>
                            <div className={styles.bottomContactForm}>
                                <h3>{t('contact_form_title')}</h3>
                                <p className={styles.bottomContactSubtitle}>{t('contact_form_subtitle')}</p>
                                <CarInquiryForm
                                    carId={car.id ?? ''}
                                    carTitle={`${car.brand} ${car.model} ${car.year}`}
                                    carPrice={car.price}
                                    phoneNumber={config.phone}
                                    whatsappNumber={config.whatsapp}
                                    submitLeadInquiry={submitLeadInquiryAction}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <SimilarCars
                currentCarId={car.id ?? ''}
                brand={car.brand}
                price={car.price}
            />
        </>
    );
}
