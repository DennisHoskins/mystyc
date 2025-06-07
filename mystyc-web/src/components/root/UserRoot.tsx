'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { isUserOnboarded } from '@/auth/util';
import Dashboard from '@/components/root/user/dashboard/Dashboard';
import OnboardingLayout from '@/components/root/user/onboarding/OnboardingLayout';

export default function UserRoot() {
  const { user, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setShowOnboarding(!isUserOnboarded(user.userProfile));
    }
  }, [loading, user]);

  if (loading || !user) {
    return null; // or a spinner if desired
  }

  return showOnboarding ? <OnboardingLayout /> : <Dashboard />;
}
