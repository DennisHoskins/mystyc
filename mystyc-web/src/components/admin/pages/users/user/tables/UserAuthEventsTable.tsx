'use client'

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';
import { Pagination } from 'mystyc-common/admin';
import { getUserAuthEvents } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import AuthenticationsTable from '@/components/admin/pages/authentications/AuthenticationsTable';

interface UserAuthEventsTableProps {
  firebaseUid?: string | null;
  isActive?: boolean;
}

export default function UserAuthEvents({ firebaseUid, isActive = false }: UserAuthEventsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserAuthEvents = useCallback(async (page: number) => {
    try {
      if (!firebaseUid) {
        return;
      }

      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getUserAuthEvents({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});

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
  }, [firebaseUid, setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUserAuthEvents(0);
    }
  }, [isActive, hasLoaded, loadUserAuthEvents]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load user auth events'
        error={error}
        onRetry={() => loadUserAuthEvents(0)}
      />
    )
  }

  return (
    <AuthenticationsTable
      hideUserColumn={true}
      data={authEvents}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadUserAuthEvents}
      onRefresh={() => loadUserAuthEvents(currentPage)}
    />
  );
}