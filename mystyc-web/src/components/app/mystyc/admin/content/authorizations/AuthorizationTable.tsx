'use client';

import { AuthEvent } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';

interface AuthorizationTableProps {
  label?: string;
  data: AuthEvent[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
  hideUserColumn?: boolean;
}

export default function AuthorizationTable({
  label,
  data,
  loading,
  error,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh,
  hideUserColumn = false
}: AuthorizationTableProps) {
  const baseColumns: Column<AuthEvent>[] = [
    { key: 'event', header: 'Event', link: (e) => `/admin/authorization/${e._id}`, render: (e) => e.type || 'Unknown' },
    { key: 'deviceName', header: 'Device', link: (e) => `/admin/devices/${e.deviceId}`, render: (e) => e.deviceName || 'Unnamed Device' },
    { key: 'timestamp', header: 'Timestamp', align: 'right', link: (e) => `/admin/authorization/${e._id}`, render: (e) => formatDateForDisplay(e.clientTimestamp) || '-' },
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
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onRefresh={onRefresh}
      emptyMessage="No Auth Events found."
    />
  );
}