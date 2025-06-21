'use client';

import { useEffect } from 'react';
import { useUser, useBusy } from '@/components/context/AppContext';

export default function OnboardingLayout() {
  const user = useUser();
  const { setBusy } = useBusy();

  useEffect(() => {
      setBusy(false);
  }, [setBusy]);

  if (!user) {
    return;
  }

  return <>Onboarding</>;
};

