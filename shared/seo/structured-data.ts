export type StructuredData = Record<string, unknown>;

/**
 * Organization schema for homepage
 */
export function organizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'SwissCars.md',
    description: 'Authorized car dealer from Switzerland. We import premium cars with full history and warranty.',
    url: 'https://swisscars.md',
    logo: 'https://swisscars.md/media/general/swiss-logo-2-red.png',
    image: 'https://swisscars.md/media/general/swiss-logo-2-red.png',
    telephone: '+373612345', // Update with actual number
    areaServed: {
      '@type': 'Country',
      name: 'Moldova',
    },
    sameAs: [
      // Add actual social media URLs
      'https://www.facebook.com/swisscars',
      'https://www.instagram.com/swisscars',
    ],
    priceRange: '$$$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Street Address Here', // Update
      addressLocality: 'Chisinau',
      addressRegion: 'Chisinau',
      postalCode: '2001',
      addressCountry: 'MD',
    },
  };
}

/**
 * Car product schema for inventory detail pages
 */
export function carProductSchema(car: {
  name: string;
  slug: string;
  price: number;
  year?: number;
  mileage?: number;
  description?: string;
  image?: string;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: car.name,
    url: `https://swisscars.md/inventory/${car.slug}`,
    image: car.image || 'https://swisscars.md/media/general/swiss-logo-2-red.png',
    description: car.description || `${car.year} ${car.name}`,
    brand: {
      '@type': 'Brand',
      name: car.name.split(' ')[0], // Make brand from first word
    },
    offers: {
      '@type': 'Offer',
      price: car.price.toString(),
      priceCurrency: 'USD',
      url: `https://swisscars.md/inventory/${car.slug}`,
      availability: 'https://schema.org/InStock',
    },
    ...(car.year && { productionDate: car.year.toString() }),
    ...(car.mileage && { mileageFromOdometer: { '@type': 'QuantitativeValue', value: car.mileage } }),
  };
}

/**
 * Breadcrumb schema for navigation
 */
export function breadcrumbSchema(items: Array<{ name: string; url: string }>): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
