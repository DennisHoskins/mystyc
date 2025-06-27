'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { SessionDevice } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { logger } from '@/util/logger';

export default function UsersTable() {
  const [sessionsDevices, setSessionsDevices] = useState<SessionDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const columns: Column<SessionDevice>[] = [
    { key: 'deviceId', header: 'Device'},
    { key: 'sessionId', header: 'Session'},
  ];

  const loadSessionsDevices = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getSessionsDevices({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessionsDevices(data);
      setHasMore(data.length === LIMIT);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load Sessions Devices:', err);
      setError('Failed to load Sessions Devices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessionsDevices(0);
  }, [loadSessionsDevices]);

  return (
    <AdminTable<SessionDevice>
      data={sessionsDevices}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={loadSessionsDevices}
      onRetry={() => loadSessionsDevices(currentPage)}
      emptyMessage="No Session Devices found."
    />
  );
}
