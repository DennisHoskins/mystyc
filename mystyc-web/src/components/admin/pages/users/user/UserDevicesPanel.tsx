'use client';

import { useState, useEffect, useCallback } from 'react';

import { Device } from 'mystyc-common/schemas/';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import AdminErrorPage from '@/components/admin/ui/AdminError';
import DevicesTable from '@/components/admin/pages/devices/DevicesTable';
import DeviceIcon from '@/components/admin/ui/icons/DeviceIcon'

export default function UserDevicesPanel({ firebaseUid }: { firebaseUid: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const LIMIT = 20;

  const loadUserDevices = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.users.getUserDevices(firebaseUid, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setDevices(response.data);
      setCurrentPage(page);
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
        onPageChange={loadUserDevices}
        onRefresh={() => loadUserDevices(currentPage)}
      />
  );
}