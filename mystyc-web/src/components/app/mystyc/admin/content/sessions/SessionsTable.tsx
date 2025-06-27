'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Session } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { logger } from '@/util/logger';

export default function UsersTable() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const columns: Column<Session>[] = [
    { key: 'sessionId', header: 'Session'},
    { key: 'email', header: 'User'},
    { key: 'deviceName', header: 'Device'},
  ];

  const loadSessions = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getSessions({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessions(data);
      setHasMore(data.length === LIMIT);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions(0);
  }, [loadSessions]);

  return (
    <AdminTable<Session>
      data={sessions}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={loadSessions}
      onRetry={() => loadSessions(currentPage)}
      emptyMessage="No Sessions found."
    />
  );
}
