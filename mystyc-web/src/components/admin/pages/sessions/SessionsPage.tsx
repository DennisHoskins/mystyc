'use client';

import { useState, useEffect, useCallback } from 'react';

import { AdminListResponse, AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { Session } from '@/interfaces';
import { SessionStats } from '@/interfaces/admin/stats';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import SessionsTable from './SessionsTable';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionsDashboard from './SessionsDashboard';

export default function SessionsPage() {
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<SessionStats> | null>(null);
  const [data, setData] = useState<AdminListResponse<Session> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setBusy(1000);

      const statsQuery = apiClientAdmin.getDefaultStatsQuery();
      const stats = await apiClientAdmin.sessions.getStats(statsQuery);

      setStats(stats);
    } catch (err) {
      logger.error('Failed to load session stats:', err);
      setError('Failed to load session stats. Please try again.');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, [setBusy]);

  const loadSessions = useCallback(async (page: number) => {
    try {
      setError(null);
      setLoading(true);
      setBusy(1000);

      const listQuery = apiClientAdmin.getDefaultListQuery(page);
      const response = await apiClientAdmin.sessions.getSessions(listQuery);

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, [setBusy, ]);

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
          data={data?.data}
          pagination={data?.pagination}
          loading={loading}
          currentPage={currentPage}
          onPageChange={loadSessions}
          onRefresh={() => loadSessions(0)}
        />
      }
    />
  );
}