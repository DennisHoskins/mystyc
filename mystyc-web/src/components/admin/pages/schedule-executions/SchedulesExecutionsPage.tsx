'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { ScheduleExecution } from 'mystyc-common/schemas';
import { ScheduleExecutionStats, AdminListResponse, AdminStatsQuery } from 'mystyc-common/admin';
import { getScheduleExecutionStats, getExecutions } from '@/server/actions/admin/schedules';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import SchedulesExecutionsTable from './SchedulesExecutionsTable';
import SchedulesExecutionsDashboard from './SchedulesExecutionsDashboard';

export type ScheduleExecutionView = 'summary' | 'executions';

export default function SchedulesExecutionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setBusy } = useBusy();
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<ScheduleExecutionStats | null>(null);
  const [data, setData] = useState<AdminListResponse<ScheduleExecution> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const getCurrentView = useCallback((): ScheduleExecutionView => {
    if (searchParams.has('executions')) return 'executions';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedules', href: '/admin/schedules' },
    { label: 'Schedules Executions' },
  ];

  const handleTabChange = (tabId: string) => {
    const view = tabId as ScheduleExecutionView;
    setActiveTab(tabId);
    
    if (view === 'summary') {
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

  useEffect(() => {
    setActiveTab(getCurrentView());
  }, [searchParams, getCurrentView]);

  const tabs: Tab[] = [
    {
      id: 'summary',
      label: 'Summary',
      hasCount: false
    },
    {
      id: 'executions',
      label: 'Executions',
      count: data?.pagination?.totalItems,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col space-y-4'>
          <div className='flex-1 flex'>
            <SchedulesExecutionsDashboard
              key={'events'}
              query={query}
              stats={stats} 
              charts={['events', 'performance']}
            />
          </div>
          <div className='flex-1 flex'>
            <SchedulesExecutionsDashboard
              key={'recent'}
              query={query}
              stats={stats} 
              charts={['recent']}
            />
          </div>
        </div>
      )
    },
    {
      id: 'executions',
      content: (
        <SchedulesExecutionsTable 
          data={data?.data}
          pagination={data?.pagination}
          currentPage={currentPage}
          onPageChange={loadSchedulesExecutions}
          onRefresh={() => loadSchedulesExecutions(0)}
        />
      )
    }
  ];

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadSchedulesExecutions(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={() => <ScheduleIcon variant='schedule-execution' />}
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <SchedulesExecutionsDashboard
          query={query}
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