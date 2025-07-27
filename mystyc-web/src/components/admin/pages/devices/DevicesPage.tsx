'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Device } from 'mystyc-common/schemas/';
import { DeviceStats, DevicesSummary, AdminListResponse } from 'mystyc-common/admin';
import { getDevicesSummaryStats, getDevices, getOnlineDevices, getOfflineDevices } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import DevicesBreadcrumbs from './DevicesBreadcrumbs';
import DevicesDashboard from './DevicesDashboard';
import DevicesDashboardGrid from './DevicesDashboardGrid';
import DevicesSummaryPanel from './DevicesSummaryPanel';
import DevicesTable from './DevicesTable';

export type DeviceView = 'summary' | 'all' | 'online' | 'offline';

export default function DevicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<DeviceStats | null>(null);
  const [summary, setSummary] = useState<DevicesSummary | null>(null);
  const [data, setData] = useState<AdminListResponse<Device> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const getCurrentView = (): DeviceView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('online')) return 'online';
    if (searchParams.has('offline')) return 'offline';
    return 'summary';
  };
  const currentView = getCurrentView();
  const breadcrumbs = DevicesBreadcrumbs({ currentView, onClick: () => { router.push("devices"); }});
  const showDeviceTable = currentView !== 'summary';

  const handleClick = (view: DeviceView) => {
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

  const loadDevices = useCallback(async (page: number) => {
    try {
      if (!showDeviceTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      let response: AdminListResponse<Device>;

      switch (currentView) {
        case 'online':
          response = await getOnlineDevices({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'offline':
          response = await getOfflineDevices({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
        case 'all':
        default:
          response = await getDevices({deviceInfo: getDeviceInfo(), ...listQuery});
          break;
      }

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showDeviceTable, setBusy, currentView]);

  useEffect(() => {
    if (currentView == 'online' || currentView == 'offline' || currentView == 'all') loadDevices(0);
    else loadData();
  }, [loadData, loadDevices, currentView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={DevicesIcon}
      headerContent={
        <DevicesSummaryPanel 
          summary={summary}
          handleClick={handleClick}
          currentView={currentView}
        />
      }
      sideContent={
        <DevicesDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={
        showDeviceTable == false && <DevicesDashboardGrid stats={stats} />
      }
      tableContent={
        <>
          {showDeviceTable ?
            (
              <DevicesTable
                loading = {isBusy}
                data={data?.data}
                currentPage={currentPage}
                pagination={data?.pagination}
                onPageChange={() => loadDevices(currentPage)}
                onRefresh={() => loadDevices(0)}
              />
            ) : (
              <div className='flex-1 flex'>
                <DevicesDashboard 
                  key={'browsers'}
                  stats={stats} 
                  charts={['browsers']}
                />
              </div>
            )
          }
        </>
      }
    />
  );
}