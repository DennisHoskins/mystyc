'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { getUser } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import UserIcon from '@/components/admin/ui/icons/UserIcon';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import UserDetailsPanel from './UserDetailsPanel';
import UserSubscriptionPanel from './UserSubscriptionPanel';
import UserProfileCard from './UserProfileCard';
import UserAstrologyCard from './UserAstrologyCard';
import UserTabCard from './UserTabCard';

export default function UserPage({ firebaseUid }: { firebaseUid: string }) {
  const { setBusy } = useBusy();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getUser({deviceInfo: getDeviceInfo(), firebaseUid});
      setUser(data);
    } catch (err) {
      logger.error('Failed to load user:', err);
      setError('Failed to load user. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [firebaseUid, setBusy]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: user ? `${(user.firstName && user.lastName) ? user.firstName + " " + user.lastName : user.email}` : `${firebaseUid}`},
  ], [user, firebaseUid]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadUser}
      breadcrumbs={breadcrumbs}
      icon={<UserIcon size={6} userProfile={user} />}
      title={user && (user.firstName && user.lastName) ? user.firstName + " " + user.lastName : `Unknown User`}
      headerContent={<UserDetailsPanel user={user} />}
      sectionsContent={[<UserProfileCard key='user-profile' user={user} />]}
      sidebarContent={<UserSubscriptionPanel key='subscriptions' user={user} />}
      mainContent={[
        <UserAstrologyCard key='star-sign' user={user} />,
        <UserTabCard key='user-tables' firebaseUid={user && user.firebaseUid} />
      ]}
    />
  );    
}