'use client';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import WelcomeCard from '@/components/mystyc/pages/home/WelcomeCard';
import InsightsCard from '@/components/mystyc/ui/insights/InsightsCard';
import UpgradePlusCard from './ui/UpgradePlusCard';
// import Onboard from '@/components/mystyc/pages/onboard/Onboard';

export default function Mystyc({ user } : { user: AppUser }) {
  useFirebaseMessaging();

  return (
    <div className="flex flex-1 justify-center p-6">
      <div className='w-full max-w-content text-center space-y-6'>
        {/* {user.isOnboard ? <Welcome /> : <Onboard />} */}
        <WelcomeCard user={user} />
        <InsightsCard user={user} />
        {!user.isPlus && <UpgradePlusCard />}
      </div>
    </div>
  );
}
