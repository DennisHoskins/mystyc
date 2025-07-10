'use client';

import { Schedule } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface SchedulesTableProps {
  label?: string;
  data: Schedule[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function SchedulesTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRefresh,
}: SchedulesTableProps) {
  const columns: Column<Schedule>[] = [
    { key: 'event', header: 'Event', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s.event_name || 'Unknown' },
    { key: 'id', header: 'Event', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s._id },
    { key: 'enabled', header: 'Enabled', align: 'right', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s.enabled ? "Yes" : "No" },
    { key: 'timezone', header: 'Timezone', align: 'right', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s.timezone_aware ? "Yes" : "No" },
    { key: 'time', header: 'Time', align: 'right', link: (s) => `/admin/schedules/${s._id}`, render: (s) => s.time.hour + ':' + s.time.minute },
  ];

  return (
    <AdminTable<Schedule>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Schedules found."
    />
  );
}