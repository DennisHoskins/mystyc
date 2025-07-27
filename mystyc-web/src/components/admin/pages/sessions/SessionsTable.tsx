import { Session } from '@/interfaces';
import { Pagination } from 'mystyc-common/admin';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface SessionsTableProps {
  label?: string;
  data?: Session[];
  pagination?: Pagination;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function SessionsTable({
  label,
  data,
  pagination,
  loading,
  currentPage,
  onPageChange,
  onRefresh
}: SessionsTableProps) {
  const columns: Column<Session>[] = [
    { key: 'sessionId', header: 'Session', link: (s) => `/admin/sessions/${s.sessionId}`},
    { key: 'email', header: 'User', link: (s) => `/admin/users/${s.uid}`},
    { key: 'deviceName', header: 'Device', link: (s) => `/admin/devices/${s.deviceId}`},
    { key: 'age', header: 'Age', align: 'right', link: (s) => `/admin/sessions/${s.sessionId}`, render: (s) => s.createdAt && formatTimestampForComponent(s.createdAt)},
  ];

  return (
    <AdminTable<Session>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Sessions found."
    />
  );
}