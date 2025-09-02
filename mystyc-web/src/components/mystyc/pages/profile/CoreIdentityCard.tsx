import { Fingerprint } from 'lucide-react';

import { AppUser } from '@/interfaces/app/app-user.interface';
import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';

export default function CoreIdentityCard({ user } : { user: AppUser }) {
  if (!user.userProfile.astrology) {
    return null;
  }

console.log(user.userProfile.astrology.interactions);

  return (
    <Card className='!p-10 col-span-2'>
      <Link href={`/signs/${user.userProfile.astrology.sunSign}`} className='flex items-center space-x-2 hover:!no-underline'>
        <Fingerprint className='w-6 h-6 text-white -ml-2' />
        <Heading level={2}>Core Identity</Heading>
      </Link>
      {user.userProfile.astrology.planetaryData?.Sun.position.sign}
    </Card>
  );
}
