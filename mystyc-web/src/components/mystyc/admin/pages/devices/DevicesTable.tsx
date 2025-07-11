'use client';

import { Device } from '@/interfaces';

import AdminTable, { Column } from '@/components/mystyc/admin/ui/AdminTable';
import { IconComponent } from '@/components/ui/icons/Icon';

interface DevicesTableProps {
  icon?: IconComponent;
  label?: string;
  data: Device[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function DevicesTable({
  icon,
  label,
  data,
  loading,
  currentPage,
  totalPages,
  totalItems,
  hasMore,
  onPageChange,
  onRefresh
}: DevicesTableProps) {
  const columns: Column<Device>[] = [
    { key: 'deviceName', header: 'Name', link: (d) => `/admin/devices/${d.deviceId}`, render: (d) => d.deviceName ? d.deviceName.split(" (")[0]  : 'Unnamed Device' },
    { key: 'deviceId', header: 'Id', link: (d) => `/admin/devices/${d.deviceId}`, render: (d) => d.deviceId.substring(0, 15) + '...' },
    { key: 'timezone', header: 'Timezone', render: (d) => d.timezone || 'Unknown' },
    { key: 'fcmToken', header: 'Fcm Token', align: 'right', render: (d) => d.fcmToken ? 'Ready' : 'Not Ready' },
  ];

  return (
    <AdminTable<Device>
      icon={icon}
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Devices found."
    />
  );
}