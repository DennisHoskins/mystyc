'use client';

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import NotificationsTable from '@/components/admin/pages/notifications/NotificationsTable';
import AdminErrorPage from '@/components/admin/ui/AdminError';

interface UserNotificationsTableProps {
  firebaseUid: string;
  isActive?: boolean;
}

export default function UserNotifications({ firebaseUid, isActive = false }: UserNotificationsTableProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadUserNotifications = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.users.getUserNotifications(firebaseUid, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setNotifications(response.data);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUserNotifications(0);
    }
  }, [isActive, hasLoaded, loadUserNotifications]);

  // Don't render anything if tab isn't active and hasn't loaded
  if (!isActive && !hasLoaded) {
    return null;
  }

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load device notifications'
        error={error}
        onRetry={() => loadUserNotifications(0)}
      />
    )
  }

  return (
    <div>
      <NotificationsTable
        hideUserColumn={true}
        data={notifications}
        loading={loading}
        currentPage={currentPage}
        onPageChange={loadUserNotifications}
        onRefresh={() => loadUserNotifications(currentPage)}
      />
    </div>
  );
}