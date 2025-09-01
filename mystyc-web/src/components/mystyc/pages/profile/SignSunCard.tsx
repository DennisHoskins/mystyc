import { AppUser } from '@/interfaces/app/app-user.interface';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Card from '@/components/ui/Card';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';

export default function SignSunCard({ user } : { user: AppUser }) {
  if (!user.userProfile.astrology) {
    return null;
  }

console.log(user.userProfile.astrology.interactions);

  return (
    <Card className='!p-10 col-span-2'>
      <Link href={`/signs/${user.userProfile.astrology.sunSign}`} className='flex items-center space-x-2 hover:!no-underline'>
        {getZodiacIcon(user.userProfile.astrology.sunSign, 'w-8 h-8 text-white')}
        <Heading level={2}>Zodiac: {user.userProfile.astrology.sunSign}</Heading>
      </Link>
      {user.userProfile.astrology.planetaryData?.Sun.position.sign}
    </Card>
  );
}
