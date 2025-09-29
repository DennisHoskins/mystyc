import { useState, useEffect, useCallback } from 'react';
import { BaseAdminQuery } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface SessionDevice {
  deviceId: string;
  sessionId: string | null;
}

interface SessionDevicePagination {
  offset: number;
  limit: number;
  total: number;
}

interface SessionDeviceResponse {
  data: SessionDevice[];
  pagination: SessionDevicePagination;
}

type SessionDeviceServerAction = (params: {deviceInfo: any} & BaseAdminQuery) => Promise<SessionDeviceResponse>;

interface SessionDevicesTableProps {
  serverAction: SessionDeviceServerAction;
  onRefresh?: () => void;
}

export default function SessionDevicesTable({
  serverAction,
  onRefresh
}: SessionDevicesTableProps) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<SessionDeviceResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadSessionDevices = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await serverAction({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load session devices:', err);
      setError('Failed to load session devices. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [serverAction, setBusy]);

  const handlePageChange = (page: number) => {
    loadSessionDevices(page);
  };

  const handleRefresh = () => {
    loadSessionDevices(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    loadSessionDevices(0);
  }, [loadSessionDevices]);

  const columns: Column<SessionDevice>[] = [
    { key: 'deviceId', header: 'Device ID', link: (d) => `/admin/devices/${d.deviceId}` },
    { key: 'sessionId', header: 'Session ID', link: (d) => d.sessionId ? `/admin/sessions/${d.sessionId}` : null, render: (d) => d.sessionId || 'No Active Session' },
  ];

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <AdminTable<SessionDevice>
      data={data?.data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={Math.ceil((data?.pagination?.total || 0) / (data?.pagination?.limit || 1))}
      hasMore={(data?.pagination?.offset || 0) + (data?.pagination?.limit || 0) < (data?.pagination?.total || 0)}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      emptyMessage="No Session Devices found."
    />
  );
}