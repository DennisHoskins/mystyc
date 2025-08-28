import { Fingerprint } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';

export default function CoreIdentityPanel({ user } : { user: AppUser }) {

console.log(user);

  return (
    <Panel className='w-full h-full'>
      <div className='flex items-center justify-center space-x-1'>
        <Fingerprint className='w-8 h-8 text-white -ml-2' />
        <Heading level={2}>Core Identity</Heading>
      </div>
    </Panel>
  );
}
