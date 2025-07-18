'use client';

import { useEffect, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import UserIcon from '@/components/admin/ui/icons/UserIcon';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SubscriptionUserPanel({ firebaseUid }: { firebaseUid: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!firebaseUid) return;

    const loadUser = async () => {
      try {
        const user = await apiClientAdmin.getUser(firebaseUid);
        setUser(user);
      } catch (err) {
        logger.error('Failed to load user:', err);
      }
    };

    loadUser();
  }, [firebaseUid]);

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={<UserIcon userProfile={user} />} />
        <Heading level={5} className='flex-1'>User Details</Heading>
      </div>

      <hr />

      <div className="pt-4">
        <AdminDetailGrid>
          <AdminDetailField
            label="Full Name"
            value={user?.fullName}
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
      </div>
    </>      
  );
}