'use client'

import { useState, useEffect, useCallback } from 'react';

import { ScheduleExecution } from 'mystyc-common/schemas';
import { ScheduleExecutionStats, AdminListResponse, AdminStatsQuery } from 'mystyc-common/admin';
import { getScheduleExecutionStats, getExecutions } from '@/server/actions/admin/schedules';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesExecutionsTable from './SchedulesExecutionsTable';
import SchedulesExecutionsDashboard from './SchedulesExecutionsDashboard';

export default function SchedulesExecutionsPage() {
  const { setBusy, isBusy } = useBusy();
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<ScheduleExecutionStats | null>(null);
  const [data, setData] = useState<AdminListResponse<ScheduleExecution> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: 'Schedules Executions' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultStatsQuery();
      const stats = await getScheduleExecutionStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setQuery(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load schedule execution stats:', err);
      setError('Failed to load schedule execution stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadSchedulesExecutions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getExecutions({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load schedule executions:', err);
      setError('Failed to load schedule executions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

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
          query={query}
           stats={stats} 
           charts={['stats']}
         />
       }
      itemContent={[
        <SchedulesExecutionsDashboard
          key={'performance'}
          query={query}
          stats={stats} 
          charts={['performance']}
        />,
        <SchedulesExecutionsDashboard
          key={'recent'}
          query={query}
          stats={stats} 
          charts={['recent']}
        />,
        <SchedulesExecutionsDashboard
          key={'events'}
          query={query}
          stats={stats} 
          charts={['events']}
        />,
      ]}
       tableContent={
         <SchedulesExecutionsTable 
           data={data?.data}
           pagination={data?.pagination}
           loading={isBusy}
           currentPage={currentPage}
           onPageChange={loadSchedulesExecutions}
           onRefresh={() => loadSchedulesExecutions(0)}
         />
       }
    />   
  );
}