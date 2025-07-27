'use client'

import { useEffect, useCallback, useState } from 'react';

import { Device } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getUserDevices } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import DevicesTable from '@/components/admin/pages/devices/DevicesTable';
import AdminErrorPage from '@/components/admin/ui/AdminError';

interface UserDevicesTableProps {
  firebaseUid?: string | null;
  isActive?: boolean;
}

export default function UserDevices({ firebaseUid, isActive = false }: UserDevicesTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [notifications, setDevices] = useState<Device[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserDevices = useCallback(async (page: number) => {
    try {
      if (!firebaseUid) {
        return;
      }

      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getUserDevices({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});

      setDevices(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [firebaseUid, setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUserDevices(0);
    }
  }, [isActive, hasLoaded, loadUserDevices]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load device notifications'
        error={error}
        onRetry={() => loadUserDevices(0)}
      />
    )
  }

  return (
    <DevicesTable
      data={notifications}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadUserDevices}
      onRefresh={() => loadUserDevices(currentPage)}
    />
  );
}