import { SunMoon } from 'lucide-react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import AdminCard from '@/components/admin/ui/AdminCard';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';

export default function UserStarSignCard({ user }: { user?: UserProfile | null }) {
  return (
    <AdminCard
      icon={<SunMoon className='w-6 h-6' />}
      title='Astrology'
      text={`Created: {formatDateForComponent(user?.astrology?.createdAt)}`}
    >
      <AdminDetailGrid cols={5} className='mt-1'>
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
    </AdminCard>
  );
}