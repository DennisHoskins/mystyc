import type { Metadata } from 'next';

import '@/styles/globals.css';

import AppContext from '@/components/layout/context/AppContext';
import ErrorBoundary from '@/components/layout/ErrorBoundary';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const title = process.env.NODE_ENV === 'production' ? 'mystyc' : 'mystyc // dev';
  
  return {
    title,
    description: 'Get to know yourself better',
    icons: {
      icon: '/favicon/favicon.ico',
      apple: '/favicon/apple-touch-icon.png',
      shortcut: '/favicon/android-chrome-192x192.png',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <ErrorBoundary>
          <AppContext>
            {children}
          </AppContext>
        </ErrorBoundary>
      </body>
    </html>
  );
}
