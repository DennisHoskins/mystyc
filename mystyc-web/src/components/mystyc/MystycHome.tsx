'use client'

import { AppUser } from '@/interfaces/app/app-user.interface';
import OnboardingPage from './pages/onboard/OnboardPage';
import InsightsPage from './pages/insights/InsightsPage';

export default function MystycHome({ user } : { user: AppUser }) {
  if (!user.userProfile.astrology) {
    return <OnboardingPage user={user} />;
  }
  return <InsightsPage user={user} />;
}