'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminErrorPage from '@/components/mystyc/admin/ui/AdminError';
import UsersTable from '@/components/mystyc/admin/content/users/UsersTable';
import UsersIcon from '@/components/mystyc/admin/ui/icons/UsersIcon'

export default function DeviceUsersPanel({ deviceId }: { deviceId: string}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadDeviceUsers = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getDeviceUsers(deviceId, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setUsers(response.data);
      setTotalItems(response.pagination.totalItems);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    loadDeviceUsers(0);
  }, [loadDeviceUsers]);

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
        icon={UsersIcon}
        label={`Users`}
        data={users}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        hasMore={hasMore}
        onPageChange={loadDeviceUsers}
        onRefresh={() => loadDeviceUsers(currentPage)}
      />
  );
}