'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { DeviceStats, DevicesSummary } from 'mystyc-common/admin';
import { getDevicesSummaryStats, getDevices, getOnlineDevices, getOfflineDevices } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import DevicesBreadcrumbs from './DevicesBreadcrumbs';
import DevicesDashboard from './DevicesDashboard';
import DevicesDashboardGrid from './DevicesDashboardGrid';
import DevicesTable from './DevicesTable';

export type DeviceView = 'summary' | 'all' | 'online' | 'offline';

export default function DevicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [summary, setSummary] = useState<DevicesSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = useCallback((): DeviceView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('online')) return 'online';
    if (searchParams.has('offline')) return 'offline';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = DevicesBreadcrumbs({ currentView: activeTab as DeviceView, onClick: () => { router.push("devices"); }});

  const handleTabChange = (tabId: string) => {
    const view = tabId as DeviceView;
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
      const summaryStats = await getDevicesSummaryStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
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

  const getSummaryCount = () => {
    if (!summary) return null;
    const total = summary?.total || 0;
    const online = summary?.online || 0;
    if (total === 0) return "0%";
    const percentage = (online / total * 100).toFixed(1);
    return `${percentage}%`;
  };

  const tabs: Tab[] = [
    {
      id: 'summary',
      label: 'Summary',
      count: getSummaryCount(),
      hasCount: true
    },
    {
      id: 'all',
      label: 'All Devices',
      count: summary?.total,
      hasCount: true
    },
    {
      id: 'online',
      label: 'Online',
      count: summary?.online,
      hasCount: true
    },
    {
      id: 'offline',
      label: 'Offline',
      count: summary?.offline,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col overflow-hidden'>
          <DevicesDashboardGrid stats={stats} />
          <div className='flex-1 flex'>
            <DevicesDashboard 
              key={'browsers'}
              stats={stats} 
              charts={['browsers']}
            />
          </div>
        </div>
      )
    },
    {
      id: 'all',
      content: (
        <DevicesTable
          serverAction={getDevices}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'online',
      content: (
        <DevicesTable
          serverAction={getOnlineDevices}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'offline',
      content: (
        <DevicesTable
          serverAction={getOfflineDevices}
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
      icon={DevicesIcon}
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <DevicesDashboard 
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