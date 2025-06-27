'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification } from '@/interfaces';
import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

export default function AdminDevices() {
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

  const columns: Column<Notification>[] = [
    { key: 'event', header: 'Event', render: (e) => e.type || 'Unknown' },
    { key: 'sentAt', header: 'Sent', align: 'right', render: (e) => formatDateForDisplay(e.sentAt) || '-' },
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
        description="View sent push notifications, message history, and delivery status for user communications"
      />

      <div className="mt-6">
        <AdminTable<Notification>
          data={notifications}
          columns={columns}
          loading={loading}
          error={error}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={loadNotifications}
          onRetry={() => loadNotifications(currentPage)}
          emptyMessage="No Notifications found."
        />
      </div>
    </>
  );
}
