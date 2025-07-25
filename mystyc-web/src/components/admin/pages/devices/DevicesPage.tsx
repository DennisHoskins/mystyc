'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Device } from 'mystyc-common/schemas/';
import { DeviceStats } from 'mystyc-common/admin/interfaces/stats';
import { DevicesSummary } from 'mystyc-common/admin/interfaces/summary';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

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
  const { admin }  = useAdmin();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<DeviceStats> | null>(null);
  const [summary, setSummary] = useState<DevicesSummary | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  // Determine current view from URL
  const getCurrentView = (): DeviceView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('online')) return 'online';
    if (searchParams.has('offline')) return 'offline';
    return 'summary';
  };

  const currentView = getCurrentView();
  const breadcrumbs = DevicesBreadcrumbs({ currentView, onClick: () => { router.push("devices"); }});
  const showDeviceTable = currentView !== 'summary';

  // Change URL without page reload
  const handleClick = (view: DeviceView) => {
    if (view === 'summary') {
      router.push(pathname);
      return;
    }
    
    // For query params without values, manually construct
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const summaryStats = await admin.devices.getSummaryStats(statsQuery);

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.devices]);

  const loadDevices = useCallback(async (page: number) => {
    try {
      if (!showDeviceTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      } as const;

      let response: AdminListResponse<Device>;
      
      switch (currentView) {
        case 'online':
          response = await admin.devices.getDevices("online", query);
          break;
        case 'offline':
          response = await admin.devices.getDevices("offline", query);
          break;
        case 'all':
          response = await admin.devices.getDevices("all", query);
          break;
        default:
          return;
      }

      setDevices(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showDeviceTable, setBusy, currentView, admin.devices]);

  // Reload data when view changes
  useEffect(() => {
    if (currentView == 'online' || currentView == 'offline' || currentView == 'all') loadDevices(0);
    else loadData();
  }, [loadData, loadDevices, currentView, admin.devices]);

  // Load stats and summary on mount
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
      itemContent={showDeviceTable == false && <DevicesDashboardGrid stats={stats} />}
      tableContent={
        <>
          {showDeviceTable ?
            (
              <DevicesTable
                loading = {admin.devices.state.loading}
                data={devices}
                currentPage={currentPage}
                totalPages={totalPages}
                hasMore={hasMore}
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