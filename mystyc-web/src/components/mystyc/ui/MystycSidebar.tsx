'use client'

import { CalendarDays, Home, SunMoon, Users } from 'lucide-react';
import UserStar from '@/components/ui/icons/UserStar';
import Card from '@/components/ui/Card';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';

export default function MystycSidebar() {
  return (
    <Card className='mt-10'>
      <Panel className='text-white hover:bg-purple-100'>
        <Link href='/' className='flex !flex-row items-center space-x-2'>
          <Home className='w-6 h-6' />
          <Text variant='muted'>My Dashboard</Text>
        </Link>
      </Panel>
      <Panel className='text-white hover:bg-purple-100'>
        <Link href='/profile' className='flex !flex-row items-center space-x-2'>
          <UserStar width={20} height={20} />
          <Text variant='muted'>Astrological Profile</Text>
        </Link>
      </Panel>
      <Panel className='text-white hover:bg-purple-100'>
        <Link href='/today' className='flex !flex-row items-center space-x-2'>
          <SunMoon className='w-6 h-6' />
          <Text variant='muted'>Today&apos;s Insights</Text>
        </Link>
      </Panel>
      <Panel className='text-white hover:bg-purple-100'>
        <Link href='/compatibility' className='flex !flex-row items-center space-x-2'>
          <Users width={20} height={20} />
          <Text variant='muted'>Relationships &amp; Compatibility</Text>
        </Link>
      </Panel>
      <Panel className='text-white hover:bg-purple-100'>
        <Link href='/forecast' className='flex !flex-row items-center space-x-2'>
          <CalendarDays width={20} height={20} />
          <Text variant='muted'>Forecast &amp; Planning</Text>
        </Link>
      </Panel>
    </Card>
  );
}