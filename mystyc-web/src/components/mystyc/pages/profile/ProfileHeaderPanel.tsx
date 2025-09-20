import { AstrologyComplete, User } from 'mystyc-common';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Link from '@/components/ui/Link';

export default function ProfileHeaderPanel({ user, astrology } : { user: User | null | undefined, astrology: AstrologyComplete | null | undefined }) {
  return (
    <div className='flex flex-col space-y-4'>
      <Link href={`/astrology/signs/${user?.userProfile?.astrology?.sun.sign}`} className='flex items-center hover:!no-underline'>
        {user && getZodiacIcon(user.userProfile?.astrology?.sun.sign, "w-8 h-8 ml-1 text-white")}
        <Heading level={1} color='text-white' className='ml-1'>{user?.userProfile?.astrology?.sun.sign}</Heading>
      </Link>

      <Text variant='small' color='text-gray-500' className="!mt-1 flex space-x-2 min-w-52">
        {astrology?.sun.signData.keywords.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ")}
      </Text>

      <Text variant='muted' color='text-gray-400' className="!mt-2" loadingHeight={20}>{user?.userProfile.astrology?.summary?.description}</Text>
    </div>
  );
}
