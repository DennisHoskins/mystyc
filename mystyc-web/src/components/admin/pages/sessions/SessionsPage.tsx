'use client';

import { useState, useEffect, useCallback } from 'react';

import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { Session } from '@/interfaces';
import { SessionStats } from '@/interfaces/admin/stats';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import SessionsTable from './SessionsTable';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionsDashboard from './SessionsDashboard';

export default function SessionsPage() {
  const { admin } = useAdmin();
  const { setBusy } = useBusy();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<SessionStats> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await admin.sessions.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load session stats:', err);
      setError('Failed to load session stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.sessions]);

  const loadSessions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const response = await admin.sessions.getSessions({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessions(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, , admin.sessions]);

  // Load stats and initial sessions data
  useEffect(() => {
    loadData();
    loadSessions(0);
  }, [loadData, loadSessions]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadSessions(0);
      }}
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
          loading={admin.sessions.state.loading}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={loadSessions}
          onRefresh={() => loadSessions(0)}
        />
      }
    />
  );
}