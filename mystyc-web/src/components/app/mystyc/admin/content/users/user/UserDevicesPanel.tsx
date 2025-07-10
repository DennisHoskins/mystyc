'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminErrorPage from '../../../ui/AdminError';
import DevicesTable from '@/components/app/mystyc/admin/content/devices/DevicesTable';
import DeviceIcon from '@/components/app/mystyc/admin/ui/icons/DeviceIcon'

export default function UserDevicesPanel({ firebaseUid }: { firebaseUid: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadUserDevices = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getUserDevices(firebaseUid, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setDevices(response.data);
      setTotalItems(response.pagination.totalItems);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  useEffect(() => {
    loadUserDevices(0);
  }, [loadUserDevices]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load user devices'
        error={error}
        onRetry={() => loadUserDevices(0)}
      />
    )
  }

  return (
      <DevicesTable
        icon={DeviceIcon}
        label={`Devices`}
        data={devices}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        hasMore={hasMore}
        onPageChange={loadUserDevices}
        onRefresh={() => loadUserDevices(currentPage)}
      />
  );
}