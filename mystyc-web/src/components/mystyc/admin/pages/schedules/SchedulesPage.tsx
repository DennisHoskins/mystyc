'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { Schedule, ScheduleStats } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/mystyc/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/mystyc/admin/ui/icons/ScheduleIcon';
import SchedulesTimezonesTable from './SchedulesTimezonesTable';
import SchedulesTable from './SchedulesTable';
import SchedulesDashboard from './SchedulesDashboard';

export default function SchedulesPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<ScheduleStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules' },
  ];

  const loadSchedules = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getSchedules({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setSchedules(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getScheduleStats(statsQuery);
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
    loadSchedules(0);
  }, [loadSchedules]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => loadSchedules(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={ScheduleIcon}
      description="Manage schedule entries: view, edit, and monitor schedule status, and performance metrics"
       sideContent={
         <SchedulesDashboard 
           stats={stats} 
           charts={['stats']}
         />
       }
      itemContent={[
        <div key='info' className='space-y-4'>
          <SchedulesDashboard 
            key={'health'}
            stats={stats} 
            charts={['health']}
          />
          <SchedulesDashboard 
            key={'next'}
            stats={stats} 
            charts={['today']}
          />
        </div>,
        <SchedulesDashboard 
          key={'events'}
          stats={stats} 
          charts={['events']}
        />,
        <SchedulesDashboard 
          key={'status'}
          stats={stats} 
          charts={['status']}
        />,
      ]}
      tableContent={[
        <SchedulesTimezonesTable key='timezones' />,
        <SchedulesTable
          key='schedules'
          label="Schedules"
          data={schedules}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadSchedules}
          onRefresh={() => loadSchedules(currentPage)}
        />
      ]}
    />   
  );
}