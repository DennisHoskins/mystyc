'use client'

import '@/styles/globals.css';

import AppContext from '@/components/ui/context/AppContext';
import GlobalError from '@/components/ui/layout/GlobalError';

export default function GlobalErrorPage() {
  return (
    <html lang="en">
      <head>
        <title>Error - mystyc</title>
        <link rel="icon" type="image/png" href="/faviocn/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/faviocn/favicon.svg" />
        <link rel="shortcut icon" href="/faviocn/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/faviocn/apple-touch-icon.png" />
        <link rel="manifest" href="/faviocn/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <AppContext>
          <GlobalError />
        </AppContext>
      </body>
    </html>
  );
}