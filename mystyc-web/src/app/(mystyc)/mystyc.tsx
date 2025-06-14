'use client';

import { useApp } from '@/components/context/AppContext';
import { useBusy } from '@/components/context/BusyContext';
import Dashboard from '@/components/mystyc/dashboard/Dashboard';
import OnboardingLayout from '@/components/mystyc/onboarding/OnboardingLayout';
import { useEffect } from 'react';

export default function Mystyc() {
  const { app } = useApp();
  const { setBusy } = useBusy();

  useEffect(() => {
    setBusy(false);
  }, 
  [setBusy])

  if (!app || !app.user) {
    return null;
  }

  return app.user.isOnboard ? <Dashboard /> : <OnboardingLayout />;
}
