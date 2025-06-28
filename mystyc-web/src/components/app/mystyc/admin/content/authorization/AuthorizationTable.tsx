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
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function AuthorizationTable({
  label,
  data,
  loading,
  error,
  currentPage,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh
}: AuthorizationTableProps) {
  const columns: Column<AuthEvent>[] = [
    { key: 'event', header: 'Event', render: (e) => e.type || 'Unknown' },
    { key: 'email', header: 'User', render: (e) => e.email || 'Unknown User' },
    { key: 'deviceName', header: 'Device', render: (e) => e.deviceName || 'Unnamed Device' },
    { key: 'timestamp', header: 'Timestamp', align: 'right', render: (e) => formatDateForDisplay(e.clientTimestamp) || '-' },
  ];

  return (
    <AdminTable<AuthEvent>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onRefresh={onRefresh}
      emptyMessage="No Auth Events found."
    />
  );
}