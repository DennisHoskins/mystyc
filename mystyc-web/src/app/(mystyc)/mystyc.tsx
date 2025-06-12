'use client';

import { useApp } from '@/components/context/AppContext';
import Dashboard from '@/components/mystyc/dashboard/Dashboard';
import OnboardingLayout from '@/components/mystyc/onboarding/OnboardingLayout';

export default function Mystyc() {
  const { app } = useApp();

  if (!app || !app.user) {
    return null;
  }

  return app.user.isOnboard ? <Dashboard /> : <OnboardingLayout />;
}
