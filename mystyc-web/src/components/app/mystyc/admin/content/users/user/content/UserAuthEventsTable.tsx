'use client';

import { useEffect, useCallback, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent } from '@/interfaces';
import { logger } from '@/util/logger';

import AuthenticationsTable from '@/components/app/mystyc/admin/content/authentications/AuthenticationsTable';

interface UserAuthEventsTableProps {
  firebaseUid: string;
  isActive?: boolean;
}

export default function UserAuthEvents({ firebaseUid, isActive = false }: UserAuthEventsTableProps) {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadUserAuthEvents = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getUserAuthEvents(firebaseUid, {
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

  return (
    <AuthenticationsTable
      hideUserColumn={true}
      data={authEvents}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={loadUserAuthEvents}
      onRetry={() => loadUserAuthEvents(currentPage)}
      onRefresh={() => loadUserAuthEvents(currentPage)}
    />
  );
}