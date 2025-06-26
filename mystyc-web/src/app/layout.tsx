import type { Metadata } from 'next';

import '@/styles/globals.css';

import { getUser } from '@/server/getUser';
import { createUserStore } from '@/store/userStore'
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
  const user = await getUser();
  createUserStore(user);

  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AppContext user={user}>
            {children}
          </AppContext>
        </ErrorBoundary>
      </body>
    </html>
  );
}
