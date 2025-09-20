'use client'

import { useEffect, useState } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { getUser } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import UserIcon from '@/components/admin/ui/icons/UserIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SubscriptionUserCard({ firebaseUid }: { firebaseUid?: string | null }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!firebaseUid) {
      return;
    }

    const loadUser = async () => {
      try {
        const user = await getUser({deviceInfo: getDeviceInfo(), firebaseUid});
        setUser(user);
      } catch (err) {
        logger.error('Failed to load user:', err);
      }
    };

    loadUser();
  }, [firebaseUid]);

  return (
    <AdminCard
      icon={<UserIcon userProfile={user} />}
      title='User Details'
    >
      <AdminDetailGrid cols={3} className='mt-1'>
        <AdminDetailField
          label="Full Name"
          value={user?.firstName + " " + user?.lastName}
          href={`/admin/users/${user?.firebaseUid}`}
        />
        <AdminDetailField
          label="Email Address"
          value={user?.email}
          href={`/admin/users/${user?.firebaseUid}`}
        />
        <AdminDetailField
          label="Firebase Uid"
          value={user?.firebaseUid}
          href={`/admin/users/${user?.firebaseUid}`}
        />
        <AdminDetailField
          label="Stripe Customer Id"
          value={user?.stripeCustomerId}
        />
        <AdminDetailField
          label="Subscription Level"
          value={user?.subscription.level}
        />
        <AdminDetailField
          label="Start Date"
          value={formatDateForDisplay(user?.subscription.startDate)}
        />
      </AdminDetailGrid>
    </AdminCard>      
  );
}