'use client';

import { useEffect, useCallback, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { OpenAIRequest } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminErrorPage from '@/components/mystyc/admin/ui/AdminError';
import OpenAIRequestsTable from '@/components/mystyc/admin/pages/openai/OpenAIRequestsTable';

interface UserOpenAIRequestsTableProps {
  firebaseUid: string;
  isActive?: boolean;
}

export default function UserOpenAIRequests({ firebaseUid, isActive = false }: UserOpenAIRequestsTableProps) {
  const [requests, setRequests] = useState<OpenAIRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadUserOpenAIRequests = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getUserOpenAIRequests(firebaseUid, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setRequests(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load requests:', err);
      setError('Failed to load requests. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadUserOpenAIRequests(0);
    }
  }, [isActive, hasLoaded, loadUserOpenAIRequests]);

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
        title='Unable to load user requests'
        error={error}
        onRetry={() => loadUserOpenAIRequests(0)}
      />
    )
  }

  return (
    <OpenAIRequestsTable
      data={requests}
      hideSourceColumn={true}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={loadUserOpenAIRequests}
      onRefresh={() => loadUserOpenAIRequests(currentPage)}
    />
  );
}