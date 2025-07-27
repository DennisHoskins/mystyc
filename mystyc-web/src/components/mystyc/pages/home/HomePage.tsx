'use client';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';

import HomeCard from '@/components/mystyc/pages/home/HomeCard';
import InsightsCard from '@/components/mystyc/ui/insights/InsightsCard';
import UpgradePlusCard from '@/components/mystyc/ui/upgrade/UpgradePlusCard';

export default function HomePage({ user } : { user: AppUser }) {
  useFirebaseMessaging();

  return (
    <>
      <HomeCard user={user} />
      <InsightsCard user={user} />
      {!user.isPlus && <UpgradePlusCard />}
    </>
  );
}
