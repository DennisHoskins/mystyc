'use client';

import { Session } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

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
    { key: 'sessionId', header: 'Session', link: (s) => `/admin/sessions/${s.sessionId}`},
    { key: 'email', header: 'User', link: (s) => `/admin/users/${s.uid}`},
    { key: 'deviceName', header: 'Device', link: (s) => `/admin/devices/${s.deviceId}`},
    { key: 'fcmToken', header: 'fcmToken', render: (s) => s.fcmToken},
    { key: 'age', header: 'Age', align: 'right', link: (s) => `/admin/sessions/${s.sessionId}`, render: (s) => formatTimestampForComponent(s.createdAt)},
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