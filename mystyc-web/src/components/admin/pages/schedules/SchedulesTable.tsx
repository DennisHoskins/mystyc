import { Schedule } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface SchedulesTableProps {
  data?: Schedule[];
  pagination?: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function SchedulesTable({
  data,
  pagination,
  currentPage,
  onPageChange,
  onRefresh,
}: SchedulesTableProps) {
  const columns: Column<Schedule>[] = [
    { key: 'event', header: 'Event', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s.event_name || 'Unknown' },
    { key: 'enabled', header: 'Enabled', align: 'center', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s.enabled ? "Yes" : "No" },
    { key: 'timezone', header: 'Local?', align: 'center', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s.timezone_aware ? "Yes" : "No" },
    { key: 'time', header: 'Time', align: 'right', link: (s) => `/admin/schedules/${s._id}`, render: (s) => `${s.time.hour}:${String(s.time.minute).padStart(2, '0')}` },
  ];

  return (
    <AdminTable<Schedule>
      data={data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Schedules found."
    />
  );
}