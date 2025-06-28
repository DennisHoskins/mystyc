'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';
import NotificationsTable from './NotificationsTable';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Notifications' },
  ];

  const loadNotifications = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getNotifications({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'sentAt',
        sortOrder: 'desc',
      });

      setNotifications(data);
      setHasMore(data.length === LIMIT);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load Notifications:', err);
      setError('Failed to load Notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(0);
  }, [loadNotifications]);

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        title={"Notifications"}
        description="View sent push notifications, message history, and delivery status for user communications"
      />

      <div className="mt-6">
        <NotificationsTable 
          data={notifications}
          loading={loading}
          error={error}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={loadNotifications}
          onRetry={() => loadNotifications(currentPage)}
        />
      </div>
    </>
  );
}