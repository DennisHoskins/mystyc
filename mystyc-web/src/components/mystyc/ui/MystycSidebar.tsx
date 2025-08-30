'use client'

import { CalendarDays, Home, SunMoon, Drama } from 'lucide-react';
import UserStar from '@/components/ui/icons/UserStar';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';

export default function MystycSidebar() {
  return (
    <div className='relative'>
      <div className='sticky top-[59px] flex flex-col space-y-2'>
        <Link href='/'>
          <Card className='items-center text-white hover:bg-purple-100 hover:!text-purple-800'>
            <Home className='w-6 h-6' />
            <Text variant='xs' className='text-center'>Dashboard</Text>
          </Card>
        </Link>
        <Link href='/profile'>
          <Card className='items-center text-white hover:bg-purple-100 hover:!text-purple-800'>
            <UserStar width={20} height={20} />
            <Text variant='xs' className='text-center'>Astrological Profile</Text>
          </Card>
        </Link>
        <Link href='/today'>
          <Card className='items-center text-white hover:bg-purple-100 hover:!text-purple-800'>
            <SunMoon className='w-6 h-6' />
            <Text variant='xs' className='text-center'>Insights</Text>
          </Card>
        </Link>
        <Link href='/relationships'>
          <Card className='items-center text-white hover:bg-purple-100 hover:!text-purple-800'>
            <Drama width={20} height={20} />
            <Text variant='xs' className='text-center'>Relationships</Text>
          </Card>
        </Link>
        <Link href='/forecast'>
          <Card className='items-center text-white hover:bg-purple-100 hover:!text-purple-800'>
            <CalendarDays width={20} height={20} />
            <Text variant='xs' className='text-center'>Forecast &amp; Planning</Text>
          </Card>
        </Link>
      </div>
    </div>
  );
}