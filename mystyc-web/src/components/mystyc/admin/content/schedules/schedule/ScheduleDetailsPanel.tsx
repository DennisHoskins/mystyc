'use client';

import { Schedule } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';

export default function ScheduleDetailsPanel({ schedule }: { schedule: Schedule }) {
  return (
    <div className='min-h-10'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Created"
            value={schedule.createdAt ? formatTimestampForComponent(new Date(schedule.createdAt).getTime()) : '-'}
          />
          <AdminDetailField
            label="Enabled"
            value={schedule.enabled ? "True" : "False"}
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
          <AdminDetailField
            label="Execution Time"
            value={schedule.time.hour + ":" + schedule.time.minute}
          />
          <AdminDetailField
            label="Timezone Aware"
            value={schedule.timezone_aware ? "True" : "False"}
          />
        </AdminDetailGroup>
     </div>
    </div>
  );
}