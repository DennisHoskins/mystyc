'use client';

import { useEffect, useState } from 'react';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useAuth } from '@/components/context/AuthContext';
import Pricing from '@/components/root/public/Pricing';

export default function PricingPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const router = useCustomRouter();
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  // Measure viewport once on mount
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Wait for both auth and viewport before deciding
  useEffect(() => {
    if (isDesktop === null || authLoading) return;

    // If no user on mobile/tablet, redirect to /login
    if (!firebaseUser && !isDesktop) {
      router.replace('/login');
    }
  }, [isDesktop, authLoading, firebaseUser, router]);

  // Only render when both auth and viewport info are ready
  if (isDesktop === null || authLoading) {
    return null;
  }
  // On desktop (even if not logged in), show Pricing
  return <Pricing />;
}
