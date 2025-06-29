'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';
import Card from '@/components/ui/Card';
import DevicesTable from './DevicesTable';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
      setError(null);

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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices(0);
  }, [loadDevices]);

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        title={`Devices ${totalItems ? `(${totalItems})` : ''}`}
        description="Monitor and control connected devices, view status device configurations"
      >
        <div className="mt-4">
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
        </div>
      </AdminHeader>
    </>
  );
}