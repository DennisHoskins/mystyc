import { Schedule } from 'mystyc-common/schemas';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ScheduleDetailsPanel({ schedule }: { schedule?: Schedule | null }) {
  return (
    <AdminDetailGrid cols={4} className='pb-1'>
      <AdminDetailField
        label="Created"
        value={schedule ? (schedule.createdAt ? formatTimestampForComponent(new Date(schedule.createdAt).getTime()) : '-') : null}
      />
      <AdminDetailField
        label="Enabled"
        value={schedule ? (schedule.enabled ? "True" : "False") : null}
      />
      <AdminDetailField
        label="Execution Time"
        value={schedule ? (`${schedule.time.hour}:${String(schedule.time.minute).padStart(2, '0')}`) : null}
      />
      <AdminDetailField
        label="Timezone Aware"
        value={schedule ? (schedule.timezone_aware ? "True" : "False") : null}
      />
    </AdminDetailGrid>
  );
}