'use client';

import { Device } from 'mystyc-common/schemas/';
import { Pagination } from 'mystyc-common/admin';

import { IconComponent } from '@/components/ui/icons/Icon';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface DevicesTableProps {
  icon?: IconComponent,
  label?: string,
  data?: Device[];
  pagination?: Pagination | null;
  loading?: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideStatusColumn?: boolean;
}

export default function DevicesTable({
  icon,
  label,
  data,
  pagination,
  loading = false,
  currentPage,
  onPageChange,
  onRefresh,
  hideStatusColumn = false
}: DevicesTableProps) {
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

  return (
    <AdminTable<Device>
      icon={icon}
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      totalItems={pagination?.totalItems}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Devices found."
    />
  );
}