'use client'

import { useEffect, useCallback, useState } from 'react';

import { UserProfile } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceUsers } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import UsersTable from '@/components/admin/pages/users/UsersTable';
import AdminErrorPage from '@/components/admin/ui/AdminError';

interface DeviceUsersTableProps {
  deviceId?: string | null;
  isActive?: boolean;
}

export default function DeviceUsersTable({ deviceId, isActive = false }: DeviceUsersTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDeviceUsers = useCallback(async (page: number) => {
    try {
      if (!deviceId) {
        return;
      }

      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getDeviceUsers({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

      setUsers(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [deviceId, setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadDeviceUsers(0);
    }
  }, [isActive, hasLoaded, loadDeviceUsers]);


  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load device users'
        error={error}
        onRetry={() => loadDeviceUsers(0)}
      />
    )
  }

  return (
    <UsersTable
      data={users}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadDeviceUsers}
      onRefresh={() => loadDeviceUsers(currentPage)}
    />
  );
}