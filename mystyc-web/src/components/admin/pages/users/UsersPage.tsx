'use client';

import { useState, useEffect, useCallback } from 'react';

import { UserStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import UsersDashboard from './UsersDashboard';
import UsersTabPanel from './UsersTabPanel';

export default function UsersPage() {
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<UserStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Users' },
  ];

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.users.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return null;
  }

  return (
   <AdminListLayout
      error={error}
      onRetry={loadStats}
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
      tableContent={<UsersTabPanel />}
    />
  );
}