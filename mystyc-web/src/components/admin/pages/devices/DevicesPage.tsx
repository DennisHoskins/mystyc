'use client';

import { useState, useEffect, useCallback } from 'react';

import { Device } from 'mystyc-common/schemas/';
import { DeviceStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import DevicesTable from './DevicesTable';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import DevicesDashboard from './DevicesDashboard';

export default function DevicesPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<DeviceStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices' },
  ];

  const loadDevices = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.devices.getDevices({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setDevices(response.data);
      setHasMore(response.pagination.hasMore == true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.devices.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'DevicesPage');
      if (!wasSessionError) {
        logger.error('Failed to load devices:', err);
        setError('Failed to load devices. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadDevices(0);
  }, [loadDevices]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadDevices(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={DevicesIcon}
      description="Monitor and control connected devices, view status device configurations"
      sideContent={
        <DevicesDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={[
        <DevicesDashboard 
          key={'activity'}
          stats={stats} 
          charts={['activity']}
        />,
        <DevicesDashboard 
          key={'browsers'}
          stats={stats} 
          charts={['browsers']}
        />,
        <DevicesDashboard 
          key={'platforms'}
          stats={stats} 
          charts={['platforms']}
        />,
      ]}
      tableContent={
        <DevicesTable
          data={devices}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadDevices}
          onRefresh={() => loadDevices(currentPage)}
        />
      }
    />
  );
}