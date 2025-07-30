import { ScheduleExecution } from 'mystyc-common/schemas';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ScheduleExecutionDetailsPanel({ execution }: { execution?: ScheduleExecution | null }) {
  return (
    <AdminDetailGrid cols={4}>
      <AdminDetailField
        label="Schedule"
        value={execution?.scheduleId}
        href={execution && `/admin/schedules/${execution.scheduleId}`}
      />
      <AdminDetailField
        label="Executed Time"
        value={execution && (execution.executedAt ? formatTimestampForComponent(new Date(execution.executedAt).getTime()) : '-')}
      />
      <AdminDetailField
        label="Local Time"
        value={execution && (execution.localTime ? formatTimestampForComponent(new Date(execution.localTime).getTime()) : '-')}
      />
      <AdminDetailField
        label="Timezone"
        value={execution?.timezone}
      />
      <AdminDetailField
        label="Scheduled Time"
        value={execution && (execution.scheduledTime.hour + ":" + execution.scheduledTime.minute)}
      />
      <AdminDetailField
        label="Duration"
        value={execution?.duration}
      />
      <AdminDetailField
        label="Status"
        value={execution?.status}
      />
    </AdminDetailGrid>
  );
}