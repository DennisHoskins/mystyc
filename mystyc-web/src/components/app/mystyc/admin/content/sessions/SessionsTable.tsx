'use client';

import { Session } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface SessionsTableProps {
  data: Session[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export default function SessionsTable({
  data,
  loading,
  error,
  currentPage,
  hasMore,
  onPageChange,
  onRetry
}: SessionsTableProps) {
  const columns: Column<Session>[] = [
    { key: 'sessionId', header: 'Session'},
    { key: 'email', header: 'User'},
    { key: 'deviceName', header: 'Device'},
  ];

  return (
    <AdminTable<Session>
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      emptyMessage="No Sessions found."
    />
  );
}