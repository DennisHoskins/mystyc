'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserStats, UserProfile } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import UsersTable from './UsersTable';
import UsersIcon from '@/components/app/mystyc/admin/ui/icons/UsersIcon';
import UsersDashboard from '../dashboard/UsersDashboard';

export default function UsersPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [data, setData] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Users' },
  ];

  const loadUsers = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getUsers({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setUsers(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

      const data = await apiClientAdmin.getUserStats();
      setData(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load users:', err);
        setError('Failed to load users. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadUsers(0);
  }, [loadUsers]);

  return (
   <AdminListLayout
      breadcrumbs={breadcrumbs}
      icon={UsersIcon}
      total={totalItems}
      description="Manage user accounts, permissions, and profile information"
      sideContent={
        <UsersDashboard 
          data={data} 
          charts={['stats']}
        />
      }
      itemContent={[
        <UsersDashboard 
          data={data} 
          charts={['profile']}
        />,
        <UsersDashboard 
          data={data} 
          charts={['registrations']}
        />,
        <UsersDashboard 
          data={data} 
          charts={['activity']}
        />
      ]}
      tableContent={
        <UsersTable 
          data={users}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasMore={hasMore}
          onPageChange={loadUsers}
          onRetry={() => loadUsers(currentPage)}
          onRefresh={() => loadUsers(currentPage)}
        />
      }
    />
  );
}