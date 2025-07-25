'use client';

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import AdminErrorPage from '@/components/admin/ui/AdminError';
import AuthenticationsTable from '@/components/admin/pages/authentications/AuthenticationsTable';

interface UserAuthEventsTableProps {
  firebaseUid: string;
  isActive?: boolean;
}

export default function UserAuthEvents({ firebaseUid, isActive = false }: UserAuthEventsTableProps) {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadUserAuthEvents = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.users.getUserAuthEvents(firebaseUid, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setAuthEvents(response.data);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load authEvents:', err);
      setError('Failed to load authEvents. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUserAuthEvents(0);
    }
  }, [isActive, hasLoaded, loadUserAuthEvents]);

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
      loading={loading}
      currentPage={currentPage}
      onPageChange={loadUserAuthEvents}
      onRefresh={() => loadUserAuthEvents(currentPage)}
    />
  );
}