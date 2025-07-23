'use client';

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { logger } from '@/util/logger';

import AuthenticationsTable from '@/components/admin/pages/authentications/AuthenticationsTable';
import AdminErrorPage from '@/components/admin/ui/AdminError';

interface DeviceAuthEventsTableProps {
  deviceId: string;
  isActive?: boolean;
}

export default function DeviceAuthEvents({ deviceId, isActive = false }: DeviceAuthEventsTableProps) {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadDeviceAuthEvents = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getDeviceAuthEvents(deviceId, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setAuthEvents(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load authEvents:', err);
      setError('Failed to load authEvents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadDeviceAuthEvents(0);
    }
  }, [isActive, hasLoaded, loadDeviceAuthEvents]);

  // Show loading state if tab is active but hasn't loaded yet
  if (isActive && !hasLoaded && !loading) {
    return null;
  }

  // Don't render anything if tab isn't active and hasn't loaded
  if (!isActive && !hasLoaded) {
    return null;
  }

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
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={loadDeviceAuthEvents}
      onRefresh={() => loadDeviceAuthEvents(currentPage)}
    />
  );
}