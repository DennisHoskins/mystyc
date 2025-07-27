'use client';

import { useState, useEffect, useCallback } from 'react';

import { AdminListResponse } from 'mystyc-common/admin';
import { Session } from '@/interfaces';
import { SessionStats } from '@/interfaces/admin/stats';
import { getSessionStats, getSessions } from '@/server/actions/admin/sessions';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import SessionsTable from './SessionsTable';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionsDashboard from './SessionsDashboard';

export default function SessionsPage() {
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [data, setData] = useState<AdminListResponse<Session> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultStatsQuery();
      const stats = await getSessionStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setStats(stats);
    } catch (err) {
      logger.error('Failed to load session stats:', err);
      setError('Failed to load session stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadSessions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getSessions({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
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
          loading={isBusy}
          currentPage={currentPage}
          onPageChange={loadSessions}
          onRefresh={() => loadSessions(0)}
        />
      }
    />
  );
}