'use client'

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getUserNotifications } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import NotificationsTable from '@/components/admin/pages/notifications/NotificationsTable';
import AdminErrorPage from '@/components/admin/ui/AdminError';

interface UserNotificationsTableProps {
  firebaseUid?: string | null;
  isActive?: boolean;
}

export default function UserNotifications({ firebaseUid, isActive = false }: UserNotificationsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserNotifications = useCallback(async (page: number) => {
    try {
      if (!firebaseUid) {
        return;
      }

      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getUserNotifications({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});

      setNotifications(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [firebaseUid, setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUserNotifications(0);
    }
  }, [isActive, hasLoaded, loadUserNotifications]);

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
    <NotificationsTable
      hideUserColumn={true}
      data={notifications}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadUserNotifications}
      onRefresh={() => loadUserNotifications(currentPage)}
    />
  );
}