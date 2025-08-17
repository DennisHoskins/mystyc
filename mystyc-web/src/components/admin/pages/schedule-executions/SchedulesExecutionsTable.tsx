import { ScheduleExecution } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ScheduleExecutionsTableProps {
  data?: ScheduleExecution[];
  pagination?: Pagination;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function SchedulesExecutionsTable({
  data,
  pagination,
  currentPage,
  onPageChange,
  onRefresh,
}: ScheduleExecutionsTableProps) {
  const columns: Column<ScheduleExecution>[] = [
    { key: 'event', header: 'Event', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.eventName || 'Unknown' },
    { key: 'scheduledTime', header: 'Scheduled', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.scheduledTime.hour + ":" + e.scheduledTime.minute.toString().padEnd(2, '0') },
    { key: 'serverTime', header: 'Server Time', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => formatDateForDisplay(e.executedAt) },
    { key: 'localTime', header: 'Local Time', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.localTime ? formatDateForDisplay(e.localTime) : formatDateForDisplay(e.executedAt) },
    { key: 'timeZone', header: 'Timezone', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.timezone || "UTC" },
  ];

  return (
    <AdminTable<ScheduleExecution>
      data={data}
      columns={columns}
      loading={data == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Schedule Executions found."
    />
  );
}