'use client'

import { useEffect, useState } from 'react';

import AppLogo from '@/components/ui/AppLogo';

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`flex min-h-screen items-center justify-center bg-white transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <AppLogo subheading="Get To Know Yourself" scale={1.5} />
    </div>
  );
}
