'use client'

import { useMemo, useState, useEffect, useCallback } from 'react';

import { Notification, UserProfile } from 'mystyc-common';
import { AdminListResponse } from 'mystyc-common/admin';
import { getUserNotifications } from '@/server/actions/admin/users';
import { getUser } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationTable from '../../../notifications/NotificationsTable';

export default function UserNotificationPage({ firebaseUid } : { firebaseUid: string}) {
  const { setBusy } = useBusy();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [data, setData] = useState<AdminListResponse<Notification> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: user ? `${(user.firstName && user.lastName) ? user.firstName + " " + user.lastName : user.email}` : ``, href: '/admin/users/' + firebaseUid},
    { label: "Notifications"},
  ], [user, firebaseUid]);

  const loadData = useCallback(async (firebaseUid: string) => {
    try {
      setError(null);
      setBusy(1000);

      const user = await getUser({deviceInfo: getDeviceInfo(), firebaseUid})
      setUser(user);

      const response = await getUserNotifications({deviceInfo: getDeviceInfo(), firebaseUid});

      setData(response);
    } catch (err) {
      logger.error('Failed to load user notifications:', err);
      setError('Failed to load user notifications. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!firebaseUid) {
      return;
    }
    loadData(firebaseUid);
  }, [loadData, firebaseUid]);

  return (
   <AdminListLayout
      title="Notifications"
      error={error}
      onRetry={() => {
        loadData(firebaseUid);
      }}
      breadcrumbs={breadcrumbs}
      icon={<NotificationIcon size={3} />}
      headerContent={
        <div className='flex flex-col grow'>
          <NotificationTable
            notifications={data}
            onRefresh={() => loadData(firebaseUid)}
          />
        </div>
      }
    />   
  );
}
