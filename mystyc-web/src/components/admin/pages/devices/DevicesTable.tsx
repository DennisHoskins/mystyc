import { useState, useEffect, useCallback } from 'react';
import { Device } from 'mystyc-common/schemas/';
import { AdminListResponse, BaseAdminQuery } from 'mystyc-common/admin';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

type DeviceServerAction = (params: {deviceInfo: any} & BaseAdminQuery) => Promise<AdminListResponse<Device>>;

interface DevicesTableProps {
  serverAction?: DeviceServerAction;
  onRefresh?: () => void;
  hideStatusColumn?: boolean;
  devices?: AdminListResponse<Device> | null;
}

export default function DevicesTable({
  serverAction,
  onRefresh,
  hideStatusColumn = false,
  devices
}: DevicesTableProps) {
  const { setBusy } = useBusy();
  const [data, setData] = useState<AdminListResponse<Device> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async (page: number) => {
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
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [serverAction, setBusy]);

  const handlePageChange = (page: number) => {
    loadDevices(page);
  };

  const handleRefresh = () => {
    loadDevices(0);
    if (onRefresh) {
      onRefresh();
    }
  };

  useEffect(() => {
    if (devices) {
      setData(devices);
      setCurrentPage(0);
      return;
    }
    loadDevices(0);
  }, [loadDevices, devices, setData]);

  const baseColumns: Column<Device>[] = [
    { key: 'deviceName', header: 'Name', link: (d) => `/admin/devices/${d.deviceId}`, render: (d) => d.deviceName ? d.deviceName.split(" (")[0] : 'Unnamed Device' },
    { key: 'deviceId', header: 'Id', link: (d) => `/admin/devices/${d.deviceId}`, render: (d) => d.deviceId.substring(0, 15) + '...' },
    { key: 'timezone', header: 'Timezone', render: (d) => d.timezone || 'Unknown' },
  ];

  const statusColumn: Column<Device> = { key: 'fcmToken', header: 'Status', align: 'center', render: (d) => d.fcmToken ? 'Online' : 'Offline' };

  const columns = hideStatusColumn == true
    ? baseColumns 
    : [
        ...baseColumns.slice(0, -1),
        statusColumn,
        baseColumns[baseColumns.length - 1]
      ];

  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  return (
    <AdminTable<Device>
      data={data?.data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={data?.pagination?.totalPages || 0}
      hasMore={data?.pagination?.hasMore || false}
      onPageChange={handlePageChange}
      onRefresh={handleRefresh}
      emptyMessage="No Devices found."
    />
  );
}