import { Session } from '@/interfaces';

import { formatTimestampForComponent } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface SessionsTableProps {
  label?: string;
  data: Session[];
  loading: boolean;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function SessionsTable({
  label,
  data,
  loading,
  currentPage,
  hasMore,
  onPageChange,
  onRefresh
}: SessionsTableProps) {
  const columns: Column<Session>[] = [
    { key: 'sessionId', header: 'Session', link: (s) => `/admin/sessions/${s.sessionId}`},
    { key: 'email', header: 'User', link: (s) => `/admin/users/${s.uid}`},
    { key: 'deviceName', header: 'Device', link: (s) => `/admin/devices/${s.deviceId}`},
    { key: 'age', header: 'Age', align: 'right', link: (s) => `/admin/sessions/${s.sessionId}`, render: (s) => formatTimestampForComponent(s.createdAt)},
  ];

  return (
    <AdminTable<Session>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Sessions found."
    />
  );
}