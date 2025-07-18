'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { UserStats } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import UsersDashboard from './UsersDashboard';
import UsersTabPanel from './UsersTabPanel';

export default function UsersPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<StatsResponseWithQuery<UserStats> | null>(null);
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