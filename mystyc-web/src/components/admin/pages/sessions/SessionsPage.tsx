'use client';

import { useState, useEffect, useCallback } from 'react';

import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { Session } from '@/interfaces';
import { SessionStats } from '@/interfaces/admin/stats';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import SessionsTable from './SessionsTable';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionsDashboard from './SessionsDashboard';

export default function SessionsPage() {
  const { setBusy } = useBusy();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<SessionStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  const loadSessions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.sessions.getSessions({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessions(response.data);
      setHasMore(response.pagination.hasMore == true);
      setCurrentPage(page);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.sessions.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load Sessions:', err);
      setError('Failed to load Sessions. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadSessions(0);
  }, [loadSessions]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadSessions(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={SessionIcon}
      description="View active user sessions and devices, monitor login activity, and manage session security settings"
       sideContent={
         <SessionsDashboard 
           stats={stats} 
         />
       }
      tableContent={
        <SessionsTable 
          data={sessions}
          loading={loading}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={loadSessions}
          onRefresh={() => loadSessions(currentPage)}
        />
      }
    />
  );
}