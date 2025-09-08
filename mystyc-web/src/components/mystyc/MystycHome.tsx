'use client'

import { useUser } from '@/components/ui/context/AppContext';
import OnboardingPage from './pages/onboard/OnboardPage';
import InsightsPage from './pages/insights/InsightsPage';

export default function MystycHome() {
  const user = useUser();
  if (!user) {
    return null;
  }
  if (!user.userProfile.astrology) {
    return <OnboardingPage user={user} />;
  }
  return <InsightsPage user={user} />;
}