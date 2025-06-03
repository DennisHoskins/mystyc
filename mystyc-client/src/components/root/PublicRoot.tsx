'use client';

import { useState, useEffect } from 'react';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import SplashScreen from '@/components/layout/SplashScreen';
import Home from '@/components/root/public/Home';

export default function PublicRoot() {
  const router = useCustomRouter();
  const [isDesktop, setIsDesktop] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Determine viewport width once
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // On mobile/tablet, show splash then redirect to login
  useEffect(() => {
    if (!isDesktop) {
      const timer = setTimeout(() => {
        router.replace('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
    // On desktop, skip splash
    setShowSplash(false);
  }, [isDesktop, router]);

  if (!isDesktop && showSplash) {
    return <SplashScreen />;
  }

  // Desktop view: marketing Home
  return <Home />;
}
