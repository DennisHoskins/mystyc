'use client';

import { useUser } from '@/components/context/AppContext';
import { useBusy } from '@/components/context/BusyContext';
import Dashboard from '@/components/mystyc/dashboard/Dashboard';
import OnboardingLayout from '@/components/mystyc/onboarding/OnboardingLayout';
import { useEffect } from 'react';

export default function Mystyc() {
  const user = useUser();
  const { setBusy } = useBusy();

  useEffect(() => {
    setBusy(false);
  }, 
  [setBusy])

  if (!user) {
    return null;
  }

  return user.isOnboard ? <Dashboard /> : <OnboardingLayout />;
}
