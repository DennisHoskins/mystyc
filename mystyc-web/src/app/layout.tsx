import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = 'mystyc' + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
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

import '@/styles/globals.css';

import { logger } from '@/util/logger';
import AppContext from '@/components/ui/layout/context/AppContext';
import ErrorBoundary from '@/components/ui/layout/ErrorBoundary';
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  logger.log("RootLayout Rendered");

  return (
    <html lang="en">
      <body className="bg-gray-200">
        <ErrorBoundary>
          <AppContext>
            {children}
          </AppContext>
        </ErrorBoundary>
      </body>
    </html>
  );
}
