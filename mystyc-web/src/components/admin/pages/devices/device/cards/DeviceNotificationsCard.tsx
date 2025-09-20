'use client'

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { getDeviceNotifications } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import NotificationsCard from '../../../notifications/NotificationsCard';

export default function DeviceNotificationsCard({ deviceId, total }: { deviceId?: string | null, total?: number | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDeviceNotifications = useCallback(async () => {
    try {
      if (!deviceId) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getDeviceNotifications({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

      setNotifications(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    }
  }, [deviceId]);

  useEffect(() => {
      loadDeviceNotifications();
  }, [hasLoaded, loadDeviceNotifications]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load notifications'
        error={error}
        onRetry={() => loadDeviceNotifications()}
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
      href={`/admin/devices/${deviceId}/notifications`} 
    />
  );
}