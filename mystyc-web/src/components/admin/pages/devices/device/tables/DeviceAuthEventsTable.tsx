'use client'

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';
import { Pagination } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceAuthEvents } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AuthenticationsTable from '@/components/admin/pages/authentications/AuthenticationsTable';
import AdminErrorPage from '@/components/admin/ui/AdminError';

interface DeviceAuthEventsTableProps {
  deviceId?: string | null;
  isActive?: boolean;
}

export default function DeviceAuthEvents({ deviceId, isActive = false }: DeviceAuthEventsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDeviceAuthEvents = useCallback(async (page: number) => {
    try {
      if (!deviceId) {
        return;
      }

      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getDeviceAuthEvents({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

      setAuthEvents(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load authEvents:', err);
      setError('Failed to load authEvents. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [deviceId, setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadDeviceAuthEvents(0);
    }
  }, [isActive, hasLoaded, loadDeviceAuthEvents]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load device auth events'
        error={error}
        onRetry={() => loadDeviceAuthEvents(0)}
      />
    )
  }

  return (
    <AuthenticationsTable
      data={authEvents}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadDeviceAuthEvents}
      onRefresh={() => loadDeviceAuthEvents(currentPage)}
    />
  );
}