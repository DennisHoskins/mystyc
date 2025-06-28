'use client';

import { Device } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface DevicesTableProps {
  data: Device[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export default function DevicesTable({
  data,
  loading,
  error,
  currentPage,
  hasMore,
  onPageChange,
  onRetry
}: DevicesTableProps) {
  const columns: Column<Device>[] = [
    { key: 'deviceName', header: 'Name', render: (d) => d.deviceName || 'Unnamed Device' },
    { key: 'timezone', header: 'Timezone', render: (d) => d.timezone || 'Unknown' },
    { key: 'fcmToken', header: 'Fcm Token', align: 'right', render: (d) => d.fcmToken ? 'Ready' : 'Not Ready' },
  ];

  return (
    <AdminTable<Device>
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      emptyMessage="No Devices found."
    />
  );
}