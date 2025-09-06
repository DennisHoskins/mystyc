'use client'

import { CalendarDays, SunMoon, Drama, BookHeart } from 'lucide-react';

import { useUser } from '@/components/ui/context/AppContext';
import UserStar from '@/components/ui/icons/UserStar';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';

export default function MystycSidebar() {
  const user = useUser();
  if (!user || !user.isOnboard) {
    return null;
  }

  return (
    <div className='relative'>
      <div className='sticky top-[59px] flex flex-col space-y-2'>
        <Link href='/'>
          <Card className='!p-4 items-center justify-center aspect-square text-white hover:bg-purple-100 hover:!text-purple-800'>
            <SunMoon className='w-6 h-6' />
            <Text variant='xs' className='text-center'>Today</Text>
          </Card>
        </Link>
        <Link href='/profile'>
          <Card className='!p-4 items-center justify-center aspect-square text-white hover:bg-purple-100 hover:!text-purple-800'>
            <UserStar width={20} height={20} />
            <Text variant='xs' className='text-center'>Astrological Profile</Text>
          </Card>
        </Link>
        <Link href='/relationships'>
          <Card className='!p-4 items-center justify-center aspect-square text-white hover:bg-purple-100 hover:!text-purple-800'>
            <Drama width={20} height={20} />
            <Text variant='xs' className='text-center'>Relationships</Text>
          </Card>
        </Link>
        <Link href='/forecast'>
          <Card className='!p-4 items-center justify-center aspect-square text-white hover:bg-purple-100 hover:!text-purple-800'>
            <CalendarDays width={20} height={20} />
            <Text variant='xs' className='text-center'>Forecast &amp; Planning</Text>
          </Card>
        </Link>
        <Link href='/astrology'>
          <Card className='!p-4 items-center justify-center aspect-square text-white hover:bg-purple-100 hover:!text-purple-800'>
            <BookHeart width={20} height={20} />
            <Text variant='xs' className='text-center'>Reference Library</Text>
          </Card>
        </Link>
      </div>
    </div>
  );
}