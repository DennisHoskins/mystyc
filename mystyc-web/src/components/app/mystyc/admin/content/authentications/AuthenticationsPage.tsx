'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent, AuthEventStats } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import AuthenticationsTable from './AuthenticationsTable';
import AuthenticationIcon from '@/components/app/mystyc/admin/ui/icons/AuthenticationIcon';
import AuthenticationDashboard from '../dashboard/AuthenticationDashboard';

export default function AuthenticationsPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [data, setData] = useState<AuthEventStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Authentication' },
  ];

  const loadAuthEvents = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

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

      const data = await apiClientAdmin.getAuthenticationStats();
      setData(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load Auth Events:', err);
        setError('Failed to load Auth Events. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadAuthEvents(0);
  }, [loadAuthEvents]);

  return (
    <AdminListLayout
      breadcrumbs={breadcrumbs}
      icon={AuthenticationIcon}
      title={`Authentication`}
      total={totalItems}
      description="Track user login and logout events, monitor authentication patterns, and review access history"
      sideContent={
        <AuthenticationDashboard 
          data={data} 
          charts={['stats']}
        />
      }
      itemContent={[
        <AuthenticationDashboard 
          data={data} 
          charts={['events']}
        />,
        <AuthenticationDashboard 
          data={data} 
          charts={['peak']}
        />,
        <AuthenticationDashboard 
          data={data} 
          charts={['duration']}
        />
      ]}
      tableContent={
        <AuthenticationsTable 
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