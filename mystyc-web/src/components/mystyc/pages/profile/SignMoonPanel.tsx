import { AppUser } from '@/interfaces/app/app-user.interface';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Panel from '@/components/ui/Panel';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';

export default function SignMoonPanel({ user } : { user: AppUser }) {
  if (!user.userProfile.astrology) {
    return null;
  }
  return (
    <Panel className="flex flex-col space-y-2">
      <Link href={`/signs/${user.userProfile.astrology.moonSign}`} className='flex items-center space-x-2 hover:!no-underline'>
        {getZodiacIcon(user.userProfile.astrology.moonSign, 'w-6 h-6 text-white')}
        <Heading level={3}>Zodiac: {user.userProfile.astrology.moonSign}</Heading>
      </Link>
    </Panel>
  );
}
