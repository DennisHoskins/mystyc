'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/components/context/AppContext';
import { isUserOnboarded } from '@/util/util';
import Dashboard from '@/components/mystyc/dashboard/Dashboard';
import OnboardingLayout from '@/components/mystyc/onboarding/OnboardingLayout';

export default function Mystyc() {
  const { app } = useApp();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (app && app.user) {
      setShowOnboarding(!isUserOnboarded(app.user.userProfile));
    }
  }, [app]);

  if (!app) {
    return null;
  }

  return showOnboarding ? <OnboardingLayout /> : <Dashboard />;
}
