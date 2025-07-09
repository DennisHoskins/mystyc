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
      error={error}
      onRetry={() => loadAuthEvents(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={AuthenticationIcon}
      description="Track user login and logout events, monitor authentication patterns, and review access history"
      sideContent={
        <AuthenticationDashboard 
          data={data} 
          charts={['stats']}
        />
      }
      itemContent={[
        <AuthenticationDashboard
          key={'peak'}  
          data={data} 
          charts={['peak']}
        />,
        <AuthenticationDashboard 
          key={'duration'}  
          data={data} 
          charts={['duration']}
        />,
        <AuthenticationDashboard 
          key={'events'}  
          data={data} 
          charts={['events']}
        />,
      ]}
      tableContent={
        <AuthenticationsTable 
          data={authEvents}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadAuthEvents}
          onRefresh={() => loadAuthEvents(currentPage)}
        />
      }
    />
  );
}