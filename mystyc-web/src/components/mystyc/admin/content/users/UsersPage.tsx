'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { UserStats, UserProfile } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/mystyc/admin/ui/AdminListLayout';
import UsersTable from './UsersTable';
import UsersIcon from '@/components/mystyc/admin/ui/icons/UsersIcon';
import UsersDashboard from './UsersDashboard';

export default function UsersPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<UserStats> | null>(null);
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

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getUserStats(statsQuery);
      setStats(stats);
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
      error={error}
      onRetry={() => loadUsers(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={UsersIcon}
      description="Manage user accounts, permissions, and profile information"
      sideContent={
        <UsersDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={[
        <UsersDashboard 
          key={'registrations'}
          stats={stats} 
          charts={['registrations']}
        />,
        <UsersDashboard 
          key={'activity'}
          stats={stats} 
          charts={['activity']}
        />,
        <UsersDashboard 
          key={'profile'}
          stats={stats} 
          charts={['profile']}
        />,
      ]}
      tableContent={
        <UsersTable 
          data={users}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasMore={hasMore}
          onPageChange={loadUsers}
          onRefresh={() => loadUsers(currentPage)}
        />
      }
    />
  );
}