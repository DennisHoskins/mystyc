'use client';

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { logger } from '@/util/logger';

import NotificationsTable from '@/components/admin/pages/notifications/NotificationsTable';
import AdminErrorPage from '@/components/admin/ui/AdminError';

interface DeviceNotificationsTableProps {
  deviceId: string;
  isActive?: boolean;
}

export default function DeviceNotifications({ deviceId, isActive = false }: DeviceNotificationsTableProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadDeviceNotifications = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getDeviceNotifications(deviceId, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setNotifications(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadDeviceNotifications(0);
    }
  }, [isActive, hasLoaded, loadDeviceNotifications]);

  // Don't render anything if tab isn't active and hasn't loaded
  if (!isActive && !hasLoaded) {
    return null;
  }

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load device notifications'
        error={error}
        onRetry={() => loadDeviceNotifications(0)}
      />
    )
  }

  return (
    <NotificationsTable
      data={notifications}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={loadDeviceNotifications}
      onRefresh={() => loadDeviceNotifications(currentPage)}
    />
  );
}