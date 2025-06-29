'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';
import Text from '@/components/ui/Text';

export default function NotificationPage({ notificationId }: { notificationId: string }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const loadNotification = useCallback(async () => {
    try {
      // setLoading(true);
      // setError(null);

      const data = await apiClientAdmin.getNotification(notificationId);
      setNotification(data);
    } catch (err) {
      logger.error('Failed to load auth event:', err);
      // setError('Failed to load auth event. Please try again.');
    } finally {
      // setLoading(false);
    }
  }, [notificationId]);

  useEffect(() => {
    loadNotification();
  }, [loadNotification]);

  // Generate breadcrumbs with auth event info
  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Authorization', href: '/admin/authorization' },
    { 
      label: notification ? (notification._id || `Device ${notificationId}`) : ``
    },
  ], [notification, notificationId]);

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        title={notification && notification._id ? notification._id : "Unknown Notification"}
      >
        <div className="space-y-1 mt-2">
          <Text variant="muted">
            <strong>FirebaseUid:</strong> {notification && notification.firebaseUid}
          </Text>
        </div>
      </AdminHeader>
    </>
  );
}