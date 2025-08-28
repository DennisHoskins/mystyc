import { Drama } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Panel from '@/components/ui/Panel';
import Heading from '@/components/ui/Heading';

export default function CompatibilityPanel({ user } : { user: AppUser }) {
  return (
    <Panel className='w-full h-full'>
      <div className='flex items-center justify-center space-x-1'>
        <Drama className='w-8 h-8 text-white -ml-2' />
        <Heading level={2}>Relationships</Heading>
      </div>
    </Panel>
  );
}
