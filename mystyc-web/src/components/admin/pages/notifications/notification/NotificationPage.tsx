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
import NotificationGenerationCard from './NotificationGenerationCard';
import NotificationMessagePanel from './NotificationMessagePanel';
import UserInfoCard from '@/components/admin/pages/users/user/UserInfoCard';
import DeviceInfoCard from '@/components/admin/pages/devices/device/DeviceInfoCard';

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
    { 
      label: notification ? (notification._id || `Notification ${notificationId}`) : ``
    },
  ], [notification, notificationId]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadNotification}
      breadcrumbs={breadcrumbs}
      icon={<NotificationIcon size={6} />}
      title={notification ? `${notification.sentBy}: ${notification.type}` : 'Unknown Notification'}
      headerContent={<NotificationDetailsPanel notification={notification} />}
      itemsContent={[
        <UserInfoCard key='user' firebaseUid={notification?.firebaseUid} />,
        <DeviceInfoCard key='device' deviceId={notification?.deviceId} />
      ]}
      sideContent={<NotificationMessagePanel notification={notification} />}
      mainContent={<NotificationGenerationCard key='generation' notification={notification} />}
    />
  );
}