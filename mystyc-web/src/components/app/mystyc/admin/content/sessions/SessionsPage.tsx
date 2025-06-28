'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Session, SessionDevice } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';
import SessionsTable from './SessionsTable';
import SessionsDevicesTable from './SessionsDevicesTable';

export default function SessionsPage() {
  // Sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState<string | null>(null);
  const [sessionsCurrentPage, setSessionsCurrentPage] = useState(0);
  const [sessionsHasMore, setSessionsHasMore] = useState(true);

  // Sessions Devices state
  const [sessionsDevices, setSessionsDevices] = useState<SessionDevice[]>([]);
  const [sessionsDevicesLoading, setSessionsDevicesLoading] = useState(true);
  const [sessionsDevicesError, setSessionsDevicesError] = useState<string | null>(null);
  const [sessionsDevicesCurrentPage, setSessionsDevicesCurrentPage] = useState(0);
  const [sessionsDevicesHasMore, setSessionsDevicesHasMore] = useState(true);

  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  const loadSessions = useCallback(async (page: number) => {
    try {
      setSessionsLoading(true);
      setSessionsError(null);

      const data = await apiClientAdmin.getSessions({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessions(data);
      setSessionsHasMore(data.length === LIMIT);
      setSessionsCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load Sessions:', err);
      setSessionsError('Failed to load Sessions. Please try again.');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const loadSessionsDevices = useCallback(async (page: number) => {
    try {
      setSessionsDevicesLoading(true);
      setSessionsDevicesError(null);

      const data = await apiClientAdmin.getSessionsDevices({
        limit: LIMIT,
        offset: page * LIMIT,
      });

      setSessionsDevices(data);
      setSessionsDevicesHasMore(data.length === LIMIT);
      setSessionsDevicesCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load Sessions Devices:', err);
      setSessionsDevicesError('Failed to load Sessions Devices. Please try again.');
    } finally {
      setSessionsDevicesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions(0);
    loadSessionsDevices(0);
  }, [loadSessions, loadSessionsDevices]);

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        title={"Sessions"}
        description="View active user sessions and devices, monitor login activity, and manage session security settings"
      />

      <div className="mt-6">
        <SessionsTable 
          data={sessions}
          loading={sessionsLoading}
          error={sessionsError}
          currentPage={sessionsCurrentPage}
          hasMore={sessionsHasMore}
          onPageChange={loadSessions}
          onRetry={() => loadSessions(sessionsCurrentPage)}
        />
      </div>

      <div className="mt-6">
        <SessionsDevicesTable 
          data={sessionsDevices}
          loading={sessionsDevicesLoading}
          error={sessionsDevicesError}
          currentPage={sessionsDevicesCurrentPage}
          hasMore={sessionsDevicesHasMore}
          onPageChange={loadSessionsDevices}
          onRetry={() => loadSessionsDevices(sessionsDevicesCurrentPage)}
        />
      </div>
    </>
  );
}