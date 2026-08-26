import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SwissCars.md - Mașini din Elveția',
    template: '%s | SwissCars.md',
  },
  description: 'Dealer autorizat de mașini din Elveția. Importăm automobile premium verificate cu istoric complet și garanție.',
  keywords: ['mașini din Elveția', 'auto import', 'dealer auto', 'mașini premium', 'SwissCars Moldova'],
  authors: [{ name: 'SwissCars.md' }],
  creator: 'SwissCars.md',
  metadataBase: new URL('https://swisscars.md'),
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    alternateLocale: ['ru_RU', 'en_US'],
    url: 'https://swisscars.md',
    siteName: 'SwissCars.md',
    title: 'SwissCars.md - Mașini din Elveția',
    description: 'Dealer autorizat de mașini din Elveția. Importăm automobile premium verificate cu istoric complet și garanție.',
    images: [
      {
        url: '/media/general/swiss-logo-2-red.png',
        width: 800,
        height: 600,
        alt: 'SwissCars.md Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwissCars.md - Mașini din Elveția',
    description: 'Dealer autorizat de mașini din Elveția',
    images: ['/media/general/swiss-logo-2-red.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is the only <html>/<body> in the tree. app/[locale]/layout.tsx and
  // app/admin/layout.tsx used to render their own on top of this one — the
  // browser silently drops the inner tags, so the outer lang="ro" here was
  // the one assistive tech and crawlers actually saw on every page,
  // regardless of locale. getLocale() works outside the [locale] segment
  // too (it reads next-intl's request-scoped detection, not the URL param),
  // and falls back to the default locale for non-localized routes like
  // /login and /admin.
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
