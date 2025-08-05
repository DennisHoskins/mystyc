import { JSX } from 'react';
import { SunMoon } from 'lucide-react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForComponent } from '@/util/dateTime';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import zodiacIcons from '@/components/ui/icons/zodiac';

export default function UserStarSignCard({ user }: { user?: UserProfile | null }) {

  function getZodiacIcon(sign?: string | null): JSX.Element | undefined {
    if (!sign) return undefined;
    const iconFn = zodiacIcons[sign.toLowerCase()];
    return iconFn?.();
  }

  return (
    <Card className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={<SunMoon className='w-6 h-6' />} />
        <div className='flex items-end w-full'>
          <Heading level={5} className='flex-1'>Star Signs</Heading>
          <Text variant='small'>Created: {formatDateForComponent(user?.astrology?.createdAt)}</Text>
        </div>
      </div>

      <hr/ >

      <AdminDetailGrid cols={5} className='mt-4'>
        <AdminDetailField
          label="Sun Sign"
          icon={getZodiacIcon(user?.astrology?.sunSign)}
          value={user && (user.astrology?.sunSign || 'Not set')}
        />
        <AdminDetailField
          label="Moon Sign"
          icon={getZodiacIcon(user?.astrology?.moonSign)}
          value={user && (user.astrology?.moonSign || 'Not set')}
        />
        <AdminDetailField
          label="Rising Sign"
          icon={getZodiacIcon(user?.astrology?.risingSign)}
          value={user && (user.astrology?.risingSign || 'Not set')}
        />
        <AdminDetailField
          label="Venus Sign"
          icon={getZodiacIcon(user?.astrology?.venusSign)}
          value={user && (user.astrology?.venusSign || 'Not set')}
        />
        <AdminDetailField
          label="Mars Sign"
          icon={getZodiacIcon(user?.astrology?.marsSign)}
          value={user && (user.astrology?.marsSign || 'Not set')}
        />
      </AdminDetailGrid>
    </Card>
  );
}