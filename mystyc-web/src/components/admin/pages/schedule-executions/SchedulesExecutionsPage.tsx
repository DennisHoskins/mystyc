'use client';

import { useState, useEffect, useCallback } from 'react';

import { ScheduleExecution } from 'mystyc-common/schemas';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { ScheduleExecutionStats } from 'mystyc-common/admin/interfaces/stats';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesExecutionsTable from './SchedulesExecutionsTable';
import SchedulesExecutionsDashboard from './SchedulesExecutionsDashboard';

export default function SchedulesExecutionsPage() {
  const { admin } = useAdmin();
  const { setBusy } = useBusy();
  const [schedulesExecutions, setSchedulesExecutions] = useState<ScheduleExecution[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<ScheduleExecutionStats> | null>(null);
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

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await admin.executions.getExecutionStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load schedule execution stats:', err);
      setError('Failed to load schedule execution stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.executions]);

  const loadSchedulesExecutions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const response = await admin.executions.getExecutions({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setSchedulesExecutions(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load schedule executions:', err);
      setError('Failed to load schedule executions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.executions]);

  // Load stats and initial executions data
  useEffect(() => {
    loadData();
    loadSchedulesExecutions(0);
  }, [loadData, loadSchedulesExecutions]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadSchedulesExecutions(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon variant='schedule-execution' />}
      description="Monitor scheduled task executions, view performance metrics and track automation success rates"
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
           loading={admin.executions.state.loading}
           currentPage={currentPage}
           totalPages={totalPages}
           hasMore={hasMore}
           onPageChange={loadSchedulesExecutions}
           onRefresh={() => loadSchedulesExecutions(0)}
         />
       }
    />   
  );
}