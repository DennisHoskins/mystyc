'use client'

import { AppUser } from '@/interfaces/app/app-user.interface';

import Card from '@/components/ui/Card';
import NamePanel from '@/components/mystyc/pages/onboard/NamePanel';
import BirthPanel from '@/components/mystyc/pages/onboard/BirthPanel';
import CityPanel from '@/components/mystyc/pages/onboard/CityPanel';
import SuccessPanel from '@/components/mystyc/pages/onboard/SuccessPanel';
import WelcomePanel from '@/components/mystyc/pages/onboard/WelcomePanel';

export default function HomePage({ user } : { user: AppUser }) {

  if (!user) {
    return null;
  }

  const hasSHownWelcome = false;

  const content = user.userProfile.zodiacSign 
    ? <SuccessPanel user={user} />
    : user.userProfile.dateOfBirth
    ? <CityPanel user={user} />
    : user.userProfile.fullName 
    ? <BirthPanel user={user} />
    : hasSHownWelcome
    ? <NamePanel user={user} />
    : <WelcomePanel user={user} />

  return (
    <div className="flex flex-1 flex-col items-center justify-center -mt-20 w-full p-4">
      <Card className='w-full md:max-w-lg text-center space-y-4 p-6'>
        {content}
      </Card>
    </div>
  );
}
