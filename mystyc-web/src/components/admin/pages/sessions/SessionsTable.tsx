import { useState, useEffect, useCallback } from 'react';
import { Session } from '@/interfaces';
import { AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

type SessionServerAction = (params: {deviceInfo: any} & BaseAdminQuery) => Promise<AdminListResponse<Session>>;

interface SessionsTableProps {
  serverAction: SessionServerAction;
  onRefresh?: () => void;
}

export default function SessionsTable({
  serverAction,
  onRefresh
}: SessionsTableProps) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<Session> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await serverAction({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load sessions:', err);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [serverAction, setBusy]);

  const handlePageChange = (page: number) => {
    loadSessions(page);
  };

  const handleRefresh = () => {
    loadSessions(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    loadSessions(0);
  }, [loadSessions]);

  const columns: Column<Session>[] = [
    { key: 'sessionId', header: 'Session', link: (s) => `/admin/sessions/${s.sessionId}`},
    { key: 'email', header: 'User', link: (s) => `/admin/users/${s.uid}`},
    { key: 'deviceName', header: 'Device', link: (s) => `/admin/devices/${s.deviceId}`},
    { key: 'age', header: 'Age', align: 'right', link: (s) => `/admin/sessions/${s.sessionId}`, render: (s) => s.createdAt && formatTimestampForComponent(s.createdAt)},
  ];

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <AdminTable<Session>
      data={data?.data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={data?.pagination?.totalPages || 0}
      hasMore={data?.pagination?.hasMore || false}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      emptyMessage="No Sessions found."
    />
  );
}