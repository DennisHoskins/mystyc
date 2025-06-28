'use client';

import { Session } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface SessionsTableProps {
  label?: string;
  data: Session[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function SessionsTable({
  label,
  data,
  loading,
  error,
  currentPage,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh
}: SessionsTableProps) {
  const columns: Column<Session>[] = [
    { key: 'sessionId', header: 'Session'},
    { key: 'email', header: 'User'},
    { key: 'deviceName', header: 'Device'},
  ];

  return (
    <AdminTable<Session>
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
      emptyMessage="No Sessions found."
    />
  );
}