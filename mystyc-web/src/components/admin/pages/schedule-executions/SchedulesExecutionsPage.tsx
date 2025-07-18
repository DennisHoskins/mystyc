'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { ScheduleExecution, ScheduleExecutionStats } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesExecutionsTable from './SchedulesExecutionsTable';
import SchedulesExecutionsDashboard from './SchedulesExecutionsDashboard';

export default function SchedulesExecutionsPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [schedulesExecutions, setSchedulesExecutions] = useState<ScheduleExecution[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<ScheduleExecutionStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: 'Schedules Executions' },
  ];

  const loadSchedulesExecutions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getScheduleExecutions({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setSchedulesExecutions(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getScheduleExecutionStats(statsQuery);
      setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SchedulesExecutionsPage');
      if (!wasSessionError) {
        logger.error('Failed to load schedule:', err);
        setError('Failed to load schedule. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadSchedulesExecutions(0);
  }, [loadSchedulesExecutions]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => loadSchedulesExecutions(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon variant='schedule-execution' />}
      description="Manage schedule entries: view, edit, and monitor schedule status, and performance metrics"
       sideContent={
         <SchedulesExecutionsDashboard
           stats={stats} 
           charts={['stats']}
         />
       }
      itemContent={[
        <SchedulesExecutionsDashboard
          key={'performance'}
          stats={stats} 
          charts={['performance']}
        />,
        <SchedulesExecutionsDashboard
          key={'recent'}
          stats={stats} 
          charts={['recent']}
        />,
        <SchedulesExecutionsDashboard
          key={'events'}
          stats={stats} 
          charts={['events']}
        />,
      ]}
       tableContent={
         <SchedulesExecutionsTable 
           data={schedulesExecutions}
           loading={loading}
           currentPage={currentPage}
           totalPages={totalPages}
           hasMore={hasMore}
           onPageChange={loadSchedulesExecutions}
           onRefresh={() => loadSchedulesExecutions(currentPage)}
         />
       }
    />   
  );
}