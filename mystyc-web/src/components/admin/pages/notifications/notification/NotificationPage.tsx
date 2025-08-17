'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { getNotification } from '@/server/actions/admin/notifications';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationDetailsPanel from './NotificationDetailsPanel';
import NotificationScheduleGenerationCard from './NotificationScheduleGenerationCard';
import UserCard from '../../users/user/UserCard';
import DeviceCard from '../../devices/device/DeviceCard';

export default function NotificationPage({ notificationId }: { notificationId: string }) {
  const { setBusy } = useBusy();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNotification = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getNotification({deviceInfo: getDeviceInfo(),  notificationId});
      setNotification(data);
    } catch (err) {
      logger.error('Failed to load notification:', err);
      setError('Failed to load notification. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [notificationId, setBusy]);

  useEffect(() => {
    loadNotification();
  }, [loadNotification]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Notifications', href: '/admin/notifications' },
    { label: notification ? (notification._id || `Notification ${notificationId}`) : ``},
  ], [notification, notificationId]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadNotification}
      breadcrumbs={breadcrumbs}
      icon={<NotificationIcon size={6} />}
      title={notification ? `${notification.sentBy}: ${notification.type}` : 'Unknown Notification'}
      headerContent={<NotificationDetailsPanel notification={notification} />}
      sideContent={[
        <UserCard key='user' firebaseUid={notification?.firebaseUid} className='!flex-none' />,
        <DeviceCard key='device' deviceId={notification?.deviceId} className='flex-1 grow' />
      ]}
      itemsContent={[<NotificationScheduleGenerationCard key='generation' notification={notification} />]}
    />
  );
}