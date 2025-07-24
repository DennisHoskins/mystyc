'use client';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';

import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface AuthenticationsTableProps {
  label?: string;
  data: AuthEvent[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideUserColumn?: boolean;
}

export default function AuthenticationsTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRefresh,
  hideUserColumn = false
}: AuthenticationsTableProps) {
  const baseColumns: Column<AuthEvent>[] = [
    { key: 'event', header: 'Event', link: (e) => `/admin/authentication/${e._id}`, render: (e) => e.type || 'Unknown' },
    { key: 'deviceName', header: 'Device', link: (e) => `/admin/devices/${e.deviceId}`, render: (e) => e.deviceName || 'Unnamed Device' },
    { key: 'timestamp', header: 'Timestamp', align: 'right', link: (e) => `/admin/authentication/${e._id}`, render: (e) => formatDateForDisplay(e.clientTimestamp) || '-' },
  ];

  const userColumn: Column<AuthEvent> = {
    key: 'email', 
    header: 'User', 
    link: (e) => `/admin/users/${e.firebaseUid}`,
    render: (e) => e.email || 'Unknown User'
  };

  const columns = hideUserColumn 
    ? baseColumns 
    : [
        baseColumns[0],
        userColumn,
        ...baseColumns.slice(1)
      ];

  return (
    <AdminTable<AuthEvent>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Authentications found."
    />
  );
}