'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon';
import NotificationDetailsPanel from './content/NotificationDetailsPanel';
import NotificationMessagePanel from './content/NotificationMessagePanel';
import UserInfoPanel from '@/components/app/mystyc/admin/content/users/user/UserInfoPanel';
import DeviceInfoPanel from '@/components/app/mystyc/admin/content/devices/device/DeviceInfoPanel';

export default function NotificationPage({ notificationId }: { notificationId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotification = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getNotification(notificationId);
      setNotification(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load notification:', err);
        setError('Failed to load notification. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [notificationId, setBusy, handleSessionError]);

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

  if (loading) {
    return null;
  }

  if (!notification) {
    return (
      <AdminItemLayout
        error={'Notification Not Found'}
        onRetry={loadNotification}
        breadcrumbs={breadcrumbs}
        icon={<NotificationIcon size={6}/>}
        title={'Unkown Notification'}
      />
    );
  }

  return (
   <AdminItemLayout
      error={error}
      onRetry={loadNotification}
      breadcrumbs={breadcrumbs}
      icon={<NotificationIcon size={6} />}
      title={notification ? `${notification.sentBy}: ${notification.type}` : 'Unknown Notification'}
      headerContent={<NotificationDetailsPanel notification={notification} />}
      sectionsContent={[
        <UserInfoPanel key='user' firebaseUid={notification.firebaseUid} />,
        (notification.deviceId && <DeviceInfoPanel key='device' deviceId={notification.deviceId} />)
      ]}
      sidebarContent={<NotificationMessagePanel notification={notification} />}
    />
  );
}