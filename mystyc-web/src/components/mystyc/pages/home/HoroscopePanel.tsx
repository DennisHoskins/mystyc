import { SunMoon } from 'lucide-react';

import { SignComplete } from 'mystyc-common';
import { AppUser } from '@/interfaces/app/app-user.interface';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';

export default function HoroscopePanel({ user, sign } : { user: AppUser, sign: SignComplete | null }) {

console.log(user, sign);

  return (
    <Panel className='flex-0 !w-60'>
      <div className='flex items-center justify-center space-x-1'>
        <SunMoon className='w-10 h-10 text-white -ml-2' />
        <Heading level={1}>Today</Heading>
      </div>
    </Panel>
  );
}
