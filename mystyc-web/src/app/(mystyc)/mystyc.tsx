'use client';

import { useUser } from '@/components/context/AppContext';
import Dashboard from '@/components/mystyc/dashboard/Dashboard';
import OnboardingLayout from '@/components/mystyc/onboarding/OnboardingLayout';

export default function Mystyc() {
  const user = useUser();

  if (!user) {
    return null;
  }

  return user.isOnboard ? <Dashboard /> : <OnboardingLayout />;
}
