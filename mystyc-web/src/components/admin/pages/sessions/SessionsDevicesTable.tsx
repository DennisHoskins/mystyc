import { SessionDevice } from '@/interfaces';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface SessionsDevicesTableProps {
  label?: string;
  data: SessionDevice[];
  loading: boolean;
  currentPage: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function SessionsDevicesTable({
  label,
  data,
  loading,
  currentPage,
  hasMore,
  onPageChange,
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
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Session Devices found."
    />
  );
}