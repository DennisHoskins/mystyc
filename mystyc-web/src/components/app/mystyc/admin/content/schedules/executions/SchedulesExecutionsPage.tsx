'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { ScheduleExecution, ScheduleExecutionStats } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/app/mystyc/admin/ui/icons/ScheduleIcon';
//import SchedulesTable from './SchedulesTable';
import SchedulesExecutionsDashboard from './SchedulesExecutionsDashboard';

export default function SchedulesPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [schedulesExecutions, setSchedulesExecutions] = useState<ScheduleExecution[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<ScheduleExecutionStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
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
      setTotalItems(response.pagination.totalItems);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getScheduleExecutionStats(statsQuery);
      setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SchedulesPage');
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

  console.log(stats, loading, currentPage, totalPages, totalItems, schedulesExecutions, hasMore);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => loadSchedulesExecutions(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={ScheduleIcon}
      description="Manage schedule entries: view, edit, and monitor schedule status, and performance metrics"
       sideContent={
         <SchedulesExecutionsDashboard
           stats={stats} 
           charts={['stats']}
         />
       }
      itemContent={[
        <div className='space-y-4'>
          <SchedulesExecutionsDashboard
            key={'performance'}
            stats={stats} 
            charts={['performance']}
          />
          <SchedulesExecutionsDashboard
            key={'breakdown'}
            stats={stats} 
            charts={['breakdown']}
          />
        </div>,
        <SchedulesExecutionsDashboard
          key={'events'}
          stats={stats} 
          charts={['timeline']}
        />,
        <SchedulesExecutionsDashboard
          key={'status'}
          stats={stats} 
          charts={['today']}
        />,
      ]}
    />   
  );
}