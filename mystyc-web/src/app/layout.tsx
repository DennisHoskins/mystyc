import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Mystyc - Daily Horoscope & Personalized Astrology Readings' + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  
  return {
    title,
    description: 'Let the stars be your guide - personalized daily horoscopes, birth chart analysis, and astrological insights. Get accurate zodiac readings based on your unique planetary positions and unlock the secrets of your astrological profile.',
    keywords: [
      'astrology app',
      'daily horoscope',
      'personalized horoscope',
      'birth chart calculator',
      'zodiac signs',
      'natal chart reading',
      'cosmic insights',
      'astrological compatibility',
      'planetary positions',
      'daily cosmic forecast',
      'astrology predictions',
      'horoscope app',
      'astrological profile',
      'zodiac compatibility',
      'celestial guidance',
      'aquarius',
      'aries',
      'cancer',
      'capricorn',
      'gemini',
      'leo',
      'libra',
      'pisces',
      'saggitarius',
      'scorpio',
      'taurus',
      'virgo',
    ].join(', '),
    authors: [{ name: 'Mystyc' }],
    creator: 'Mystyc',
    publisher: 'Mystyc',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL('https://mystyc.app'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Mystyc - Daily Horoscope & Personalized Astrology Readings',
      description: 'Unlock your cosmic potential with personalized daily horoscopes and detailed birth chart analysis. Discover what the stars reveal about your destiny.',
      url: '/',
      siteName: 'Mystyc',
      locale: 'en_CA',
      type: 'website',
      images: [
        {
          url: '/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Mystyc - Personalized Astrology App',
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add these when you set up search console
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
      // yahoo: 'your-yahoo-verification-code',
    },
    icons: {
      icon: '/favicon/favicon.ico',
      apple: '/favicon/apple-touch-icon.png',
      shortcut: '/favicon/favicon-192x192.png',
    },
    manifest: '/manifest.json',
    category: 'lifestyle',
  };
}

import '@/styles/globals.css';
import '@/styles/transition.css';

import ErrorBoundary from '@/components/ui/layout/ErrorBoundary';
import AppContext from '@/components/ui/context/AppContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO meta tags */}
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mystyc" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Mystyc",
              "description": "Personalized daily horoscopes and birth chart analysis app",
              "url": "https://mystyc.app",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Mystyc"
              },
              "keywords": "astrology, horoscope, daily horoscope, birth chart, zodiac signs, cosmic insights"
            }),
          }}
        />
      </head>
      <body>
        <ErrorBoundary>
          <AppContext>
            {children}
          </AppContext>
        </ErrorBoundary>
      </body>
    </html>
  );
}