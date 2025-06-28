'use client';

import { Device } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface DevicesTableProps {
  label?: string;
  data: Device[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function DevicesTable({
  label,
  data,
  loading,
  error,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh
}: DevicesTableProps) {
  const columns: Column<Device>[] = [
    { key: 'deviceName', header: 'Name', link: (d) => `/admin/devices/${d.deviceId}`, render: (d) => d.deviceName || 'Unnamed Device' },
    { key: 'deviceId', header: 'Id', link: (d) => `/admin/devices/${d.deviceId}`, render: (d) => d.deviceId.substring(0, 15) + '...' },
    { key: 'timezone', header: 'Timezone', render: (d) => d.timezone || 'Unknown' },
    { key: 'fcmToken', header: 'Fcm Token', align: 'right', render: (d) => d.fcmToken ? 'Ready' : 'Not Ready' },
  ];

  return (
    <AdminTable<Device>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onRefresh={onRefresh}
      emptyMessage="No Devices found."
    />
  );
}