'use client';

import { SessionDevice } from '@/interfaces';

import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface SessionsDevicesTableProps {
  label?: string;
  data: SessionDevice[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function SessionsDevicesTable({
  label,
  data,
  loading,
  error,
  currentPage,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh
}: SessionsDevicesTableProps) {
  const columns: Column<SessionDevice>[] = [
    { key: 'deviceId', header: 'Device'},
    { key: 'sessionId', header: 'Session'},
  ];

  return (
    <AdminTable<SessionDevice>
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
      emptyMessage="No Session Devices found."
    />
  );
}