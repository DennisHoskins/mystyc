'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification, NotificationStats } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import NotificationsTable from './NotificationsTable';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon';
import NotificationsDashboard from '../dashboard/NotificationsDashboard';

export default function NotificationsPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [data, setData] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Notifications' },
  ];

  const loadNotifications = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getNotifications({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'sentAt',
        sortOrder: 'desc',
      });

      setNotifications(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);

      const data = await apiClientAdmin.getNotificationStats();
      setData(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load Notifications:', err);
        setError('Failed to load Notifications. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadNotifications(0);
  }, [loadNotifications]);

  return (
   <AdminListLayout
      breadcrumbs={breadcrumbs}
      icon={NotificationIcon}
      title={`Notifications`}
      description="View sent push notifications, message history, and delivery status for user communications"
      sideContent={
        <NotificationsDashboard 
          data={data} 
          charts={['stats']}
        />
      }
      itemContent={[
        <NotificationsDashboard 
          key={'volume'}
          data={data} 
          charts={['volume']}
        />,
        <NotificationsDashboard 
          key={'platforms'}
          data={data} 
          charts={['platforms']}
        />,
        <NotificationsDashboard 
          key={'delivery'}
          data={data} 
          charts={['delivery']}
        />
      ]}
      tableContent={
        <NotificationsTable 
          data={notifications}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadNotifications}
          onRetry={() => loadNotifications(currentPage)}
          onRefresh={() => loadNotifications(currentPage)}
        />
      }
    />
  );
}