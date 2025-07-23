import { ScheduleExecution } from 'mystyc-common/schemas';

import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ScheduleExecutionDetailsPanel({ execution }: { execution: ScheduleExecution }) {
  return (
    <>
      <AdminDetailGroup>
        <AdminDetailField
          label="Schedule"
          value={execution.scheduleId}
          href={`/admin/schedules/${execution.scheduleId}`}
        />
      </AdminDetailGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Executed Time"
            value={execution.executedAt ? formatTimestampForComponent(new Date(execution.executedAt).getTime()) : '-'}
          />
          <AdminDetailField
            label="Local Time"
            value={execution.localTime ? formatTimestampForComponent(new Date(execution.localTime).getTime()) : '-'}
          />
          <AdminDetailField
            label="Timezone"
            value={execution.timezone}
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
          <AdminDetailField
            label="Scheduled Time"
            value={execution.scheduledTime.hour + ":" + execution.scheduledTime.minute}
          />
          <AdminDetailField
            label="Duration"
            value={execution.duration}
          />
          <AdminDetailField
            label="Status"
            value={execution.status}
          />
        </AdminDetailGroup>
      </div>
    </>
  );
}