'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import DevicesTable from './DevicesTable';
import DevicesIcon from '@/components/app/mystyc/admin/ui/icons/DevicesIcon';

export default function DevicesPage() {
  const { setBusy } = useBusy();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
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

      const response = await apiClientAdmin.getDevices({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setDevices(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadDevices(0);
  }, [loadDevices]);

  return (
    <AdminListLayout
      breadcrumbs={breadcrumbs}
      icon={DevicesIcon}
      title={`Devices`}
      total={totalItems}
      description="Monitor and control connected devices, view status device configurations"
      tableContent={
        <DevicesTable
          data={devices}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadDevices}
          onRetry={() => loadDevices(currentPage)}
          onRefresh={() => loadDevices(currentPage)}
        />
      }
    />
  );
}