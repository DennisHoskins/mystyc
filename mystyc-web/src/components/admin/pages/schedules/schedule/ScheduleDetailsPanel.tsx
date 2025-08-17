import { Schedule } from 'mystyc-common/schemas';
import { formatTimestampForComponent } from '@/util/dateTime';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function ScheduleDetailsPanel({ schedule }: { schedule?: Schedule | null }) {
  return (
      <AdminDetailGrid cols={4}className='mb-4'>
        <Panel>
          <AdminDetailField
            label="Created"
            value={schedule ? (schedule.createdAt ? formatTimestampForComponent(new Date(schedule.createdAt).getTime()) : '-') : null}
          />
        </Panel>
        <Panel>
          <AdminDetailField
            label="Enabled"
            value={schedule ? (schedule.enabled ? "True" : "False") : null}
          />
        </Panel>
        <Panel>
          <AdminDetailField
            label="Execution Time"
            value={schedule ? (`${schedule.time.hour}:${String(schedule.time.minute).padStart(2, '0')}`) : null}
          />
        </Panel>
        <Panel>
          <AdminDetailField
            label="Timezone Aware"
            value={schedule ? (schedule.timezone_aware ? "True" : "False") : null}
          />
        </Panel>
      </AdminDetailGrid>
  );
}