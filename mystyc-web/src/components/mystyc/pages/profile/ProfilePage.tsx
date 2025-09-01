'use client'

import { useUser } from '@/components/ui/context/AppContext';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import MystycTitle from '../../ui/MystycTitle';
import UserStar from '@/components/ui/icons/UserStar';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import SignSunCard from './SignSunCard';
import SignMoonPanel from './SignMoonPanel';
import SignRisingPanel from './SignRisingPanel';

export default function ProfilePage() {
  const user = useUser();
  if (!user || !user.userProfile.astrology) {
    return null;
  }

  return (
    <div className='w-full flex flex-col space-y-4'>
      <MystycTitle
        icon={<UserStar width={32} height={32} className='text-white' />}
        heading={user.name}
        title={user.userProfile.astrology?.sunSign}
        titleIcon={getZodiacIcon(user.userProfile.astrology?.sunSign, 'w-6 h-6 text-gray-400')}
        subtitle={`Your Personal Map of the Stars`}
      />
      <div className='grid grid-cols-3 gap-4'>
        <SignSunCard user={user} />
        <div className='flex flex-col space-y-4'>
          <SignMoonPanel user={user} />
          <SignRisingPanel user={user} />
        </div>
      </div>
    </div>
  )
}
