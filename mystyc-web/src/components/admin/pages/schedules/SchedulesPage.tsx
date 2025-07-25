'use client';

import { useState, useEffect, useCallback } from 'react';

import { Schedule } from 'mystyc-common/schemas';
import { ScheduleStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesTimezonesTable from './SchedulesTimezonesTable';
import SchedulesTable from './SchedulesTable';
import SchedulesDashboard from './SchedulesDashboard';

export default function SchedulesPage() {
  const { admin } = useAdmin();
  const { setBusy } = useBusy();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<ScheduleStats> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await admin.schedules.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load schedule stats:', err);
      setError('Failed to load schedule stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.schedules]);

  const loadSchedules = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const response = await admin.schedules.getSchedules({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setSchedules(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load schedules:', err);
      setError('Failed to load schedules. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.schedules]);

  // Load stats and initial schedules data
  useEffect(() => {
    loadData();
    loadSchedules(0);
  }, [loadData, loadSchedules]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadSchedules(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={ScheduleIcon}
      description="Manage scheduled tasks and automation rules, monitor execution status and configure timing settings"
       sideContent={
         <SchedulesDashboard 
           stats={stats} 
           charts={['stats']}
         />
       }
      itemContent={[
        <div key='info' className='space-y-4 grow flex flex-col'>
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
          loading={admin.schedules.state.loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadSchedules}
          onRefresh={() => loadSchedules(0)}
        />
      ]}
    />   
  );
}