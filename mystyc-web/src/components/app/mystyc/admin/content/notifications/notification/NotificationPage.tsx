'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification } from '@/interfaces';
import { logger } from '@/util/logger';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminBreadcrumbs from '@/components/app/mystyc/admin/ui/AdminBreadcrumbs';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

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
      <AdminBreadcrumbs breadcrumbs={breadcrumbs} />

      <Card className="h-60 order-1 lg:col-span-2 lg:order-none">
        <Heading level={2}>{notification ? notification.type + " @ " + formatDateForDisplay(notification.sentAt) : "Event"}</Heading>
      </Card>

    </>
  );
}