'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { NotificationStats, AdminStatsQuery } from 'mystyc-common/admin';
import { getNotificationStats, getNotifications } from '@/server/actions/admin/notifications';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import NotificationsBreadcrumbs from './NotificationsBreadcrumbs';
import NotificationsDashboard from './NotificationsDashboard';
import NotificationsDashboardGrid from './NotificationsDashboardGrid';
import NotificationsTable from './NotificationsTable';

export type NotificationView = 'summary' | 'all';

export default function NotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy } = useBusy();
  const [query, setQuery] = useState<Partial<AdminStatsQuery> | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = useCallback((): NotificationView => {
    if (searchParams.has('all')) return 'all';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = NotificationsBreadcrumbs({ currentView: activeTab as NotificationView, onClick: () => { router.push("notifications"); }});

  const handleTabChange = (tabId: string) => {
    const view = tabId as NotificationView;
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
      const stats = await getNotificationStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setQuery(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load notification data:', err);
      setError('Failed to load notification data. Please try again.');
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

  // Server action wrapper function
  const getAllNotifications = useCallback((params: any) => {
    return getNotifications(params);
  }, []);

  const tabs: Tab[] = [
    {
      id: 'summary',
      label: 'Summary',
    },
    {
      id: 'all',
      label: 'All Notifications',
      count: stats?.type.totalNotifications,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col overflow-hidden'>
          <NotificationsDashboardGrid query={query} stats={stats} />
          <div className='flex-1 flex'>
            <NotificationsDashboard 
              key={'volume'}
              query={query}
              stats={stats} 
              charts={['volume']}
            />
          </div>
        </div>
      )
    },
    {
      id: 'all',
      content: (
        <NotificationsTable
          serverAction={getAllNotifications}
          onRefresh={loadData}
        />
      )
    }
  ];

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={NotificationIcon}
      description="View sent push notifications, message history, and delivery status for user communications"
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <NotificationsDashboard 
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