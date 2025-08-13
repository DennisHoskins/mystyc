'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { ContentsSummary, ContentStats, AdminStatsQuery } from 'mystyc-common/admin';
import { getContentsSummaryStats, getContents, getNotificationsContents, getWebsiteContents, getUserContents, getUserPlusContents } from '@/server/actions/admin/content';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import ContentsBreadcrumbs from './ContentsBreadcrumbs';
import ContentDashboard from './ContentDashboard';
import ContentsDashboardGrid from './ContentsDashboardGrid';
import ContentsTable from './ContentsTable';

export type ContentView = 'summary' | 'all' | 'notifications' | 'website' | 'users' | 'users-plus';

export default function ContentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy } = useBusy();
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [summary, setSummary] = useState<ContentsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = useCallback((): ContentView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('notifications')) return 'notifications';
    if (searchParams.has('website')) return 'website';
    if (searchParams.has('users')) return 'users';
    if (searchParams.has('users-plus')) return 'users-plus';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = ContentsBreadcrumbs({ currentView: activeTab as ContentView, onClick: () => { router.push("content"); }});

  const handleTabChange = (tabId: string) => {
    const view = tabId as ContentView;
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
      const summaryStats = await getContentsSummaryStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setQuery(statsQuery);
      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load content data:', err);
      setError('Failed to load content data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setActiveTab(getCurrentView());
  }, [searchParams, getCurrentView]);

  // Server action wrapper functions
  const getAllContents = useCallback((params: any) => {
    return getContents(params);
  }, []);

  const getAllNotificationsContents = useCallback((params: any) => {
    return getNotificationsContents(params);
  }, []);

  const getAllWebsiteContents = useCallback((params: any) => {
    return getWebsiteContents(params);
  }, []);

  const getAllUserContents = useCallback((params: any) => {
    return getUserContents(params);
  }, []);

  const getAllUserPlusContents = useCallback((params: any) => {
    return getUserPlusContents(params);
  }, []);

  const tabs: Tab[] = [
    {
      id: 'summary',
      label: 'Summary',
    },
    {
      id: 'all',
      label: 'All Content',
      count: summary?.total || 0
    },
    {
      id: 'notifications',
      label: 'Notifications',
      count: summary?.notifications || 0
    },
    {
      id: 'website',
      label: 'Website',
      count: summary?.website || 0
    },
    {
      id: 'users',
      label: 'Users',
      count: summary?.users || 0
    },
    {
      id: 'users-plus',
      label: 'Users Plus',
      count: summary?.plus || 0
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col overflow-hidden'>
          <ContentsDashboardGrid stats={stats} />
          <div className='flex-1 flex'>
            <ContentDashboard 
              key={'performance'}
              query={query}
              stats={stats} 
              charts={['performance']}
            />
          </div>
        </div>
      )
    },
    {
      id: 'all',
      content: (
        <ContentsTable
          serverAction={getAllContents}
          onRefresh={loadData}
          contentType="all"
        />
      )
    },
    {
      id: 'notifications',
      content: (
        <ContentsTable
          serverAction={getAllNotificationsContents}
          onRefresh={loadData}
          contentType="notifications"
        />
      )
    },
    {
      id: 'website',
      content: (
        <ContentsTable
          serverAction={getAllWebsiteContents}
          onRefresh={loadData}
          contentType="website"
        />
      )
    },
    {
      id: 'users',
      content: (
        <ContentsTable
          serverAction={getAllUserContents}
          onRefresh={loadData}
          contentType="users"
        />
      )
    },
    {
      id: 'users-plus',
      content: (
        <ContentsTable
          serverAction={getAllUserPlusContents}
          onRefresh={loadData}
          contentType="users-plus"
        />
      )
    }
  ];

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={ContentIcon}
      description="Manage content entries: view, edit, and monitor generation status, sources, and performance metrics"
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <ContentDashboard 
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