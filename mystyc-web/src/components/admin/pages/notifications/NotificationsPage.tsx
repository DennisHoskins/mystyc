'use client';

import { useState, useEffect, useCallback } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';

import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import NotificationsTable from './NotificationsTable';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationsDashboard from './NotificationsDashboard';

export default function NotificationsPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<NotificationStats> | null>(null);
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

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getNotificationStats(statsQuery);
      setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'NotificationsPage');
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
      error={error}
      onRetry={() => loadNotifications(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={NotificationIcon}
      description="View sent push notifications, message history, and delivery status for user communications"
      sideContent={
        <NotificationsDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={[
        <NotificationsDashboard 
          key={'volume'}
          stats={stats} 
          charts={['volume']}
        />,
        <NotificationsDashboard 
          key={'platforms'}
          stats={stats} 
          charts={['platforms']}
        />,
        <NotificationsDashboard 
          key={'delivery'}
          stats={stats} 
          charts={['delivery']}
        />
      ]}
      tableContent={
        <NotificationsTable 
          data={notifications}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadNotifications}
          onRefresh={() => loadNotifications(currentPage)}
        />
      }
    />
  );
}