'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { getUser, getUserSummary } from '@/server/actions/admin/users';
import { UserSummary } from 'mystyc-common/admin';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Card from '@/components/ui/Card';
import UserIcon from '@/components/admin/ui/icons/UserIcon';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import UserDetailsPanel from './UserDetailsPanel';
import UserProfilePanel from './UserProfilePanel';
import UserSubscriptionCard from './cards/UserSubscriptionCard';
import UserDevicesCard from './cards/UserDevicesCard';
import UserNotificationsCard from './cards/UserNotificationsCard';
import UserAuthEventsCard from './cards/UserAuthEventsCard';

export default function UserPage({ firebaseUid }: { firebaseUid: string }) {
  const { setBusy } = useBusy();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      const data = await getUser({deviceInfo: getDeviceInfo(), firebaseUid});
      setUser(data);
      const summary = await getUserSummary({deviceInfo: getDeviceInfo(), firebaseUid})
      setSummary(summary);
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
      sideContent={[
        <UserDevicesCard key='devices' firebaseUid={user?.firebaseUid} total={summary?.devices || null} />,
        <UserNotificationsCard key='notifications' firebaseUid={user?.firebaseUid} total={summary?.notifications || null} />,
        <UserAuthEventsCard key='authEvents' firebaseUid={user?.firebaseUid} total={summary?.authEvents || null} />,
      ]}
      itemsContent={[
        <div key='subscription-profile' className='flex-1 flex flex-col space-y-1 w-full'>
          <UserSubscriptionCard key='subscriptions' user={user} />
          <Card padding={4} className={`flex-1 grow'`}>
            <UserProfilePanel key='user-profile' user={user} />
          </Card>
        </div>
      ]}
    />
  );    
}