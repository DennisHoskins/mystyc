'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import AuthorizationTable from './AuthorizationTable';

export default function AuthorizationPage() {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Authorization' },
  ];

  const loadAuthEvents = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getAuthEvents({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'clientTimestamp',
        sortOrder: 'desc',
      });

      setAuthEvents(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
    } catch (err) {
      logger.error('Failed to load Auth Events:', err);
      setError('Failed to load Auth Events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthEvents(0);
  }, [loadAuthEvents]);

  return (
    <AdminListLayout
      breadcrumbs={breadcrumbs}
      title={`Authorizations ${totalItems ? `(${totalItems})` : ''}`}
      description="Track user login and logout events, monitor authentication patterns, and review access history"
      tableContent={
        <AuthorizationTable 
          data={authEvents}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadAuthEvents}
          onRetry={() => loadAuthEvents(currentPage)}
          onRefresh={() => loadAuthEvents(currentPage)}
        />
      }
    />
  );
}