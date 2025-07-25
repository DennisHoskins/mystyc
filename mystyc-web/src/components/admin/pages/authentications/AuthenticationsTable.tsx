'use client';

import { AuthEvent } from 'mystyc-common/schemas/';

import { formatDateForDisplay } from '@/util/dateTime';

import { IconComponent } from '@/components/ui/icons/Icon';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface AuthenticationsTableProps {
  icon?: IconComponent,
  label?: string,
  data: AuthEvent[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideUserColumn?: boolean;
  hideEventTypeColumn?: boolean;
}

export default function AuthenticationsTable({
  icon,
  label,
  data,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  hasMore,
  onPageChange,
  onRefresh,
  hideUserColumn = false,
  hideEventTypeColumn = false
}: AuthenticationsTableProps) {
  const baseColumns: Column<AuthEvent>[] = [
    { key: 'deviceName', header: 'Device', link: (e) => `/admin/devices/${e.deviceId}`, render: (e) => e.deviceName || 'Unnamed Device' },
    { key: 'timestamp', header: 'Timestamp', align: 'right', link: (e) => `/admin/authentication/${e._id}`, render: (e) => formatDateForDisplay(e.clientTimestamp) || '-' },
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
  
  if (!hideUserColumn) {
    columns.push(userColumn);
  }
  
  columns.push(...baseColumns);

  return (
    <AdminTable<AuthEvent>
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
      emptyMessage="No Authentication Events found."
    />
  );
}