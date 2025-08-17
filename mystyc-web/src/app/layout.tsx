import type { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const title = 'mystyc' + (process.env.NODE_ENV === 'production' ? '' : ' // dev');
  return {
    title,
    description: 'Get to know yourself better',
    icons: {
      icon: '/favicon/favicon.ico',
      apple: '/favicon/apple-touch-icon.png',
      shortcut: '/favicon/favicon-192x192.png',
    },
  };
}

import '@/styles/globals.css';
import '@/styles/transition.css';

import ErrorBoundary from '@/components/ui/layout/ErrorBoundary';
import AppContext from '@/components/ui/context/AppContext';
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
