'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useBusy } from '@/components/layout/context/AppContext';
import { Session } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import SessionsTable from './SessionsTable';
import SessionIcon from '@/components/app/mystyc/admin/ui/icons/SessionIcon';

export default function SessionsPage() {
  const { setBusy } = useBusy();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  const loadSessions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(true);
      setLoading(true);

      const response = await apiClientAdmin.getSessions({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessions(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalItems(response.pagination.totalItems);
    } catch (err) {
      logger.error('Failed to load Sessions:', err);
      setError('Failed to load Sessions. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadSessions(0);
  }, [loadSessions]);

  return (
    <AdminListLayout
      breadcrumbs={breadcrumbs}
      icon={SessionIcon}
      title={`Sessions`}
      total={totalItems}
      description="View active user sessions and devices, monitor login activity, and manage session security settings"
      tableContent={
        <SessionsTable 
          data={sessions}
          loading={loading}
          error={error}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={loadSessions}
          onRetry={() => loadSessions(currentPage)}
          onRefresh={() => loadSessions(currentPage)}
        />
      }
    />
  );
}