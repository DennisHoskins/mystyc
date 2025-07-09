'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { useBusy } from '@/components/layout/context/AppContext';
import { Session, SessionStats } from '@/interfaces';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import SessionsTable from './SessionsTable';
import SessionIcon from '@/components/app/mystyc/admin/ui/icons/SessionIcon';
import SessionsDashboard from '../dashboard/SessionsDashboard';

export default function SessionsPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<SessionStats> | null>(null);
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

      const response = await apiClientAdmin.getSessions({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessions(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getSessionStats(statsQuery);
      setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load Sessions:', err);
        setError('Failed to load Sessions. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

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