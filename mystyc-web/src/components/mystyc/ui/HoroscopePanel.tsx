import { SunMoon } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import { SignWithRelatedData } from '@/server/actions/astrology';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';

export default function HoroscopePanel({ user, sign } : { user: AppUser, sign: SignWithRelatedData | null }) {
  return (
    <Panel className='flex-0 !w-60'>
      <div className='flex items-center justify-center space-x-1'>
        <SunMoon className='w-10 h-10 text-white -ml-2' />
        <Heading level={1}>Today</Heading>
      </div>
    </Panel>
  );
}
