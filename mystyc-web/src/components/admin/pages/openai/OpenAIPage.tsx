'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { OpenAIUsage } from 'mystyc-common/schemas';
import { OpenAIUsageStats, AdminListResponse } from 'mystyc-common/admin/interfaces';
import { getOpenAIStats, getOpenAIUsages } from '@/server/actions/admin/openai';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import OpenAIUsageTable from './OpenAIUsageTable';
import OpenAIDashboard from './OpenAIUsageDashboard';
import { AdminStatsQuery } from 'mystyc-common/admin';

export type OpenAIView = 'summary' | 'usage';

export default function OpenAIPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setBusy } = useBusy();
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<OpenAIUsageStats | null>(null);
  const [data, setData] = useState<AdminListResponse<OpenAIUsage> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const getCurrentView = useCallback((): OpenAIView => {
    if (searchParams.has('usage')) return 'usage';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'OpenAI Usage' },
  ];

  const handleTabChange = (tabId: string) => {
    const view = tabId as OpenAIView;
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
      const stats = await getOpenAIStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setQuery(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load OpenAI stats:', err);
      setError('Failed to load OpenAI stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadUsage = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getOpenAIUsages({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load OpenAI usage:', err);
      setError('Failed to load OpenAI usage. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
    loadUsage(0);
  }, [loadData, loadUsage]);

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
      id: 'usage',
      label: 'Usage',
      count: data?.pagination?.totalItems,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col space-y-4'>
          <div className='flex w-full]'>
            <OpenAIDashboard 
              key='trends'
              stats={stats} 
              charts={['budget', 'content-types', 'performance']}
              height={150}
            />
          </div>
          <OpenAIDashboard 
            key='trends'
            query={query}
            stats={stats} 
            charts={['trends']}
          />
        </div>
      )
    },
    {
      id: 'usage',
      content: (
        <OpenAIUsageTable 
          data={data?.data}
          pagination={data?.pagination}
          currentPage={currentPage}
          onPageChange={loadUsage}
          onRefresh={() => loadUsage(0)}
        />
      )
    }
  ];

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadUsage(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={ContentIcon}
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <OpenAIDashboard 
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