import type { Metadata } from 'next';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
