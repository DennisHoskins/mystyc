'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Schedule } from 'mystyc-common/schemas';
import { ScheduleStats, AdminListResponse } from 'mystyc-common/admin';
import { getScheduleStats, getSchedules } from '@/server/actions/admin/schedules';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesTimezonesTable from './SchedulesTimezonesTable';
import SchedulesTable from './SchedulesTable';
import SchedulesDashboard from './SchedulesDashboard';

export type ScheduleView = 'schedules' | 'timezones';

export default function SchedulesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<ScheduleStats | null>(null);
  const [data, setData] = useState<AdminListResponse<Schedule> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const getCurrentView = useCallback((): ScheduleView => {
    if (searchParams.has('timezones')) return 'timezones';
    return 'schedules';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules' },
  ];

  const handleTabChange = (tabId: string) => {
    const view = tabId as ScheduleView;
    setActiveTab(tabId);
    
    if (view === 'schedules') {
      router.push(pathname);
      return;
    }
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

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

  useEffect(() => {
    setActiveTab(getCurrentView());
  }, [searchParams, getCurrentView]);

  const tabs: Tab[] = [
    {
      id: 'schedules',
      label: 'Schedules',
      count: data?.pagination?.totalItems,
      hasCount: true
    },
    {
      id: 'timezones',
      label: 'Timezones',
      hasCount: false
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'schedules',
      content: (
        <div className='flex-1 flex flex-col overflow-hidden space-y-4'>
          <div className='grid grid-cols-5 gap-4 w-full h-[10em]'>
            <SchedulesDashboard 
              key={'health'}
              stats={stats} 
              charts={['health', 'today']}
            />
            <SchedulesDashboard 
              className='col-span-2'
              key={'events'}
              stats={stats} 
              charts={['events']}
            />
            <SchedulesDashboard 
              className='col-span-2'
              key={'status'}
              stats={stats} 
              charts={['status']}
            />
          </div>
          <div className='flex-1'>
            <SchedulesTable
              data={data?.data}
              pagination={data?.pagination}
              currentPage={currentPage}
              onPageChange={loadSchedules}
              onRefresh={() => loadSchedules(0)}
            />
          </div>
        </div>
      )
    },
    {
      id: 'timezones',
      content: (
        <SchedulesTimezonesTable />
      )
    }
  ];

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadSchedules(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={() => <ScheduleIcon size={3} />}
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <SchedulesDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      mainContent={
        <TabPanel 
          tabs={tabContents}
          activeTab={activeTab}
        />
      }
    />   
  );
}