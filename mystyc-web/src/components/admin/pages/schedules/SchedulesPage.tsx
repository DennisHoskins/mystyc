'use client'

import { useState, useEffect, useCallback } from 'react';

import { Schedule } from 'mystyc-common/schemas';
import { ScheduleStats, AdminListResponse } from 'mystyc-common/admin';
import { getScheduleStats, getSchedules } from '@/server/actions/admin/schedules';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Card from '@/components/ui/Card';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesTimezonesTable from './SchedulesTimezonesTable';
import SchedulesTable from './SchedulesTable';
import SchedulesDashboard from './SchedulesDashboard';
import Text from '@/components/ui/Text';

export default function SchedulesPage() {
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<ScheduleStats | null>(null);
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

      const statsQuery = getDefaultStatsQuery();
      const stats = await getScheduleStats({deviceInfo: getDeviceInfo(), ...statsQuery});

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

      const listQuery = getDefaultListQuery(page);
      const response = await getSchedules({deviceInfo: getDeviceInfo(), ...listQuery});

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
   <AdminItemLayout
      title="Schedules"
      headerContent={<Text>Manage scheduled tasks and automation rules, monitor execution status and configure timing settings</Text>}
      error={error}
      onRetry={() => {
        loadData();
        loadSchedules(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={<ScheduleIcon size={3} />}
      sideContent={
        <div className='flex-1 flex flex-col space-y-4'>
          <SchedulesDashboard 
            stats={stats} 
            charts={['stats']}
          />
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
        </div>
       }
      itemsContent={[
        <Card key='stats' className='grow grid grid-cols-3 gap-4 !space-y-0'>
          <SchedulesDashboard 
            className='col-span-2'
            key={'events'}
            stats={stats} 
            charts={['events']}
          />
          <SchedulesDashboard 
            key={'status'}
            stats={stats} 
            charts={['status']}
          />
        </Card>
      ]}
      mainContent={
        <div className='grid grid-cols-2 gap-4 flex-1 grow'>
          <Card className='grow min-h-0 overflow-hidden flex'>
            <SchedulesTimezonesTable key='timezones' />
          </Card>
          <Card className='grow min-h-0 overflow-hidden flex'>
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
          </Card>
        </div>
      }
    />   
  );
}
