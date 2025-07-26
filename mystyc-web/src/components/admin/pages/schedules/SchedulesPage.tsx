'use client';

import { useState, useEffect, useCallback } from 'react';

import { Schedule } from 'mystyc-common/schemas';
import { ScheduleStats, AdminListResponse, AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesTimezonesTable from './SchedulesTimezonesTable';
import SchedulesTable from './SchedulesTable';
import SchedulesDashboard from './SchedulesDashboard';

export default function SchedulesPage() {
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<ScheduleStats> | null>(null);
  const [data, setData] = useState<AdminListResponse<Schedule> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = apiClientAdmin.getDefaultStatsQuery();
      const stats = await apiClientAdmin.schedule.getStats(statsQuery);

     setStats(stats);
    } catch (err) {
      logger.error('Failed to load schedule stats:', err);
      setError('Failed to load schedule stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadSchedules = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = apiClientAdmin.getDefaultListQuery(page);
      const response = await apiClientAdmin.schedule.getSchedules(listQuery);

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load schedules:', err);
      setError('Failed to load schedules. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

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
          data={data?.data}
          pagination={data?.pagination}
          loading={isBusy}
          currentPage={currentPage}
          onPageChange={loadSchedules}
          onRefresh={() => loadSchedules(0)}
        />
      ]}
    />   
  );
}