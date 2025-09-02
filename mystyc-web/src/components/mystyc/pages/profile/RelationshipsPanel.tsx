import { Drama } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Panel from '@/components/ui/Panel';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';

export default function RelationshipsPanel({ user } : { user: AppUser }) {
  if (!user.userProfile.astrology) {
    return null;
  }
  return (
    <Panel className="flex flex-col space-y-2">
      <Link href={`/signs/${user.userProfile.astrology.risingSign}`} className='flex items-center space-x-2 hover:!no-underline'>
        <Drama className='w-6 h-6 text-white -ml-2' />
        <Heading level={3}>Relationships</Heading>
      </Link>
    </Panel>
  );
}
