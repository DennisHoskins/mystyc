'use client';

import { SessionDevice } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface SessionsDevicesTableProps {
  data: SessionDevice[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export default function SessionsDevicesTable({
  data,
  loading,
  error,
  currentPage,
  hasMore,
  onPageChange,
  onRetry
}: SessionsDevicesTableProps) {
  const columns: Column<SessionDevice>[] = [
    { key: 'deviceId', header: 'Device'},
    { key: 'sessionId', header: 'Session'},
  ];

  return (
    <AdminTable<SessionDevice>
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      emptyMessage="No Session Devices found."
    />
  );
}