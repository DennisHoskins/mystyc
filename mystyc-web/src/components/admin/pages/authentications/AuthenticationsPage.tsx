'use client';

import { useState, useEffect, useCallback } from 'react';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';
import { AuthEventStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin'; 

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AuthenticationsTable from './AuthenticationsTable';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AuthenticationDashboard from './AuthenticationDashboard';

export default function AuthenticationsPage() {
  const { setBusy } = useBusy();
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<AuthEventStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Authentication' },
  ];

  const loadAuthEvents = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.auth.getAuthEvents({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'clientTimestamp',
        sortOrder: 'desc',
      });

      setAuthEvents(response.data);
      setHasMore(response.pagination.hasMore == true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.auth.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load Auth Events:', err);
      setError('Failed to load Auth Events. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadAuthEvents(0);
  }, [loadAuthEvents]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadAuthEvents(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={AuthenticationIcon}
      description="Track user login and logout events, monitor authentication patterns, and review access history"
      sideContent={
        <AuthenticationDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={[
        <AuthenticationDashboard
          key={'peak'}  
          stats={stats} 
          charts={['peak']}
        />,
        <AuthenticationDashboard 
          key={'duration'}  
          stats={stats} 
          charts={['duration']}
        />,
        <AuthenticationDashboard 
          key={'events'}  
          stats={stats} 
          charts={['events']}
        />,
      ]}
      tableContent={
        <AuthenticationsTable 
          data={authEvents}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadAuthEvents}
          onRefresh={() => loadAuthEvents(currentPage)}
        />
      }
    />
  );
}