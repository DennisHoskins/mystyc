'use client';

import { JSX, useState, useEffect } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { isUserOnboarded } from '@/auth/util';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { useBusy } from '@/components/context/BusyContext';
import { logger } from '@/util/logger';

import PageContainer from '@/components/layout/PageContainer';
import SplashScreen from '@/components/layout/SplashScreen';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import Dashboard from '@/components/dashboard/Dashboard';

export default function RootRedirect() {
  const { firebaseUser, user, loading } = useAuth();
  const { setBusy } = useBusy();
  const router = useCustomRouter();
  const [renderComponent, setRenderComponent] = useState<JSX.Element | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setBusy(true, 0);
  }, [setBusy]);

  useEffect(() => {
    if (loading || firebaseUser === undefined) return;

    if (!firebaseUser && !loading) {
      setBusy(false);
      setTimeout(() => setReady(true), 1500);
      setRenderComponent(<SplashScreen />);
    } else if (firebaseUser) {
      if (!user || !isUserOnboarded(user.userProfile)) {
        logger.log('[RootRedirect] Loading onboarding');
        setRenderComponent(<OnboardingLayout />);
      } else {
        logger.log('[RootRedirect] Loading dashboard');
        setRenderComponent(<Dashboard />);
      }
    }
  }, [loading, firebaseUser, user, setBusy]);

  useEffect(() => {
    if (!firebaseUser && ready) {
      router.replace('/login');
    }
  }, [firebaseUser, ready, router]);

  return renderComponent?.type === SplashScreen ? renderComponent : (
    <PageContainer>{renderComponent}</PageContainer>
  )
}