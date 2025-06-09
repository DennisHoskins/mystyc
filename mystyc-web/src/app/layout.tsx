import type { Metadata } from 'next';
import Head from 'next/head';

import { getApp } from '@/server/appManager';

import { BusyProvider } from '@/components/context/BusyContext';
import { TransitionProvider } from '@/components/context/TransitionContext';
import { ToastProvider } from '@/components/context/ToastContext';

import ToastContainer from '@/components/ui/ToastContainer';
import HomeLayout from '@/app/(website)/layout';
import { AppProvider } from '@/components/context/AppContext';
import MystycLayout from '@/app/(mystyc)/layout';

export const metadata: Metadata = {
  title: 'mystyc',
  description: 'Get to know yourself better',
  icons: {
    icon: '/favicon/favicon.ico',
    apple: '/favicon/apple-touch-icon.png',
    shortcut: '/favicon/android-chrome-192x192.png',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const app = await getApp();

  return (
    <html lang="en">
      <Head>
        <link rel="icon" type="image/png" href="/faviocn/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/faviocn/favicon.svg" />
        <link rel="shortcut icon" href="/faviocn/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/faviocn/apple-touch-icon.png" />
        <link rel="manifest" href="/faviocn/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <ToastProvider>
          <BusyProvider>
            <TransitionProvider>
              {app ? (
                <AppProvider app={app}>
                  <MystycLayout>{children}</MystycLayout>
                </AppProvider>
              ) : (
                <HomeLayout>{children}</HomeLayout>
              )}
            </TransitionProvider>
          </BusyProvider>
           <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
