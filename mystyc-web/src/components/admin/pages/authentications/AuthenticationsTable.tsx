import { useState, useEffect, useCallback } from 'react';
import { AuthEvent } from 'mystyc-common/schemas/';
import { AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

type AuthEventServerAction = (params: {deviceInfo: any} & BaseAdminQuery) => Promise<AdminListResponse<AuthEvent>>;

interface AuthenticationsTableProps {
  serverAction?: AuthEventServerAction;
  onRefresh?: () => void;
  hideUserColumn?: boolean;
  hideEventTypeColumn?: boolean;
  authEvents?: AdminListResponse<AuthEvent> | null;
}

export default function AuthenticationsTable({
  serverAction,
  onRefresh,
  hideUserColumn = false,
  hideEventTypeColumn = false,
  authEvents
}: AuthenticationsTableProps) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<AuthEvent> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadAuthEvents = useCallback(async (page: number) => {
    if (!serverAction) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await serverAction({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load auth events:', err);
      setError('Failed to load auth events. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [serverAction, setBusy]);

  const handlePageChange = (page: number) => {
    loadAuthEvents(page);
  };

  const handleRefresh = () => {
    loadAuthEvents(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    if (authEvents) {
      setData(authEvents);
      setCurrentPage(0);
      return;
    }
    loadAuthEvents(0);
  }, [loadAuthEvents, authEvents, setData]);

  const baseColumns: Column<AuthEvent>[] = [
    { key: 'deviceName', header: 'Device', link: (e) => `/admin/devices/${e.deviceId}`, render: (e) => e.deviceName || 'Unnamed Device' },
  ];

  const eventTypeColumn: Column<AuthEvent> = { 
    key: 'event', 
    header: 'Event', 
    link: (e) => `/admin/authentication/${e._id}`, 
    render: (e) => e.type || 'Unknown' 
  };

  const userColumn: Column<AuthEvent> = {
    key: 'email', 
    header: 'User', 
    link: (e) => `/admin/users/${e.firebaseUid}`,
    render: (e) => e.email || 'Unknown User'
  };

  // Build columns based on what should be hidden
  const columns: Column<AuthEvent>[] = [];
  
  if (!hideEventTypeColumn) {
    columns.push(eventTypeColumn);
  }

  columns.push({ 
    key: 'timestamp', 
    header: 'Timestamp', 
    link: (e) => `/admin/authentication/${e._id}`, 
    render: (e) => formatDateForDisplay(e.clientTimestamp) || '-' 
  })  
  
  if (!hideUserColumn) {
    columns.push(userColumn);
  }
  
  columns.push(...baseColumns);

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <AdminTable<AuthEvent>
      data={data?.data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={data?.pagination?.totalPages || 0}
      hasMore={data?.pagination?.hasMore || false}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      emptyMessage="No Authentication Events found."
    />
  );
}