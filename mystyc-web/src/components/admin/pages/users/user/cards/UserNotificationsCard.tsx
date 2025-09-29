'use client'

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { getUserNotifications } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import NotificationsCard from '../../../notifications/NotificationsCard';

export default function UserNotificationCard({ firebaseUid, total }: { firebaseUid?: string | null, total: number | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserNotifications = useCallback(async () => {
    try {
      if (!firebaseUid) {
        return;
      }
      setError(null);
      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 1;
      listQuery.sortBy = 'createdAt';
      listQuery.sortOrder = 'desc'
      const response = await getUserNotifications({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});
      setNotifications(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    }
  }, [firebaseUid]);

  useEffect(() => {
      loadUserNotifications();
  }, [hasLoaded, loadUserNotifications]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load notifications'
        error={error}
        onRetry={() => loadUserNotifications()}
      />
    )
  }

  if (!notifications || !notifications.length) {
    return null;
  }
  
  return (
    <NotificationsCard 
      notifications={notifications} 
      total={total} 
      href={`/admin/users/${firebaseUid}/notifications`} 
    />
  );
}