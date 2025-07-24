import { ScheduleExecution } from 'mystyc-common/schemas';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ScheduleExecutionsTableProps {
  label?: string;
  data: ScheduleExecution[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function ScheduleExecutionsTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRefresh,
}: ScheduleExecutionsTableProps) {
  const columns: Column<ScheduleExecution>[] = [
    { key: 'event', header: 'Event', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.eventName || 'Unknown' },
    { key: 'scheduledTime', header: 'Scheduled', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.scheduledTime.hour + ":" + e.scheduledTime.minute },
    { key: 'serverTime', header: 'Server Time', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => formatDateForDisplay(e.executedAt) },
    { key: 'localTime', header: 'Local Time', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.localTime ? formatDateForDisplay(e.localTime) : "-" },
    { key: 'timeZone', header: 'Timezone', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => e.timezone || "-" },
  ];

  return (
    <AdminTable<ScheduleExecution>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Schedule Executions found."
    />
  );
}