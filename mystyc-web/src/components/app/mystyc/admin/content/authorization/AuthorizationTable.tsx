'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

export default function AuthorizationTable() {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const columns: Column<AuthEvent>[] = [
    { key: 'event', header: 'Event', render: (e) => e.type || 'Unknown' },
    { key: 'email', header: 'User', render: (e) => e.email || 'Unknown User' },
    { key: 'deviceName', header: 'Device Name', render: (e) => e.deviceName || 'Unnamed Device' },
    { key: 'timestamp', header: 'Timestamp', align: 'right', render: (e) => formatDateForDisplay(e.clientTimestamp) || '-' },
  ];

  const loadAuthEvents = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getAuthEvents({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'clientTimestamp',
        sortOrder: 'desc',
      });

      setAuthEvents(data);
      setHasMore(data.length === LIMIT);
      setCurrentPage(page);
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
    <AdminTable<AuthEvent>
      data={authEvents}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={loadAuthEvents}
      onRetry={() => loadAuthEvents(currentPage)}
      emptyMessage="No Auth Events found."
    />
  );
}
