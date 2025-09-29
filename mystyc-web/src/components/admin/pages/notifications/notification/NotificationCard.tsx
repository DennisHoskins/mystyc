'use client'

import { useState, useEffect, useCallback } from 'react';

import { Notification } from 'mystyc-common/schemas/notification.schema';
import { getNotification } from '@/server/actions/admin/notifications';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon'
import { formatDateForComponent } from '@/util/dateTime';

export default function NotificationCard({ notificationId, className }: { notificationId?: string | null, className?: string }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotification = useCallback(async (notificationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotification({deviceInfo: getDeviceInfo(), notificationId});
      setNotification(data);
    } catch (err) {
      logger.error('Failed to load notification:', err);
      setError('Failed to load notification. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!notificationId) {
      return;
    }
    loadNotification(notificationId);
  }, [loadNotification, notificationId]);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div>{error}</div>
    )
  }

  if (!notification) {
    return (
      <div>Notification not found</div>
    )
  }
  return (
    <AdminCard
      icon={<NotificationIcon />}
      title={notification.type}
      href={`/admin/notifications/${notificationId}`}
      className={`flex flex-col space-y-1 ${className}`}
    >
      <Panel padding={4}>
        <AdminDetailGrid>
          <AdminDetailField
            label="Notification Id"
            value={notification._id}
            href={`/admin/notifications/${notificationId}`}
          />
          <AdminDetailField
            label="Sent"
            value={formatDateForComponent(notification.sentAt)}
          />
          <AdminDetailField
            label="Sent"
            value={formatDateForComponent(notification.sentAt)}
          />
        </AdminDetailGrid>
      </Panel>
    </AdminCard>
  );
}