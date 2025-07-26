import { Notification } from 'mystyc-common/schemas';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function NotificationGenerationCard({ notification }: { notification?: Notification | null }) {
  return (
    <Card>
      <AdminDetailGroup cols={2}>
        <div className='flex items-center'>
          <Avatar size={'small'} icon={<ScheduleIcon />} className='mr-4' />
          <AdminDetailField
            label="Schedule"
            value={notification && (notification.scheduleId || '-')}
            href={notification && (notification.scheduleId ? `/admin/schedules/${notification.scheduleId}` : null)}
          />
        </div>
        <div className='flex items-center'>
          <Avatar size={'small'} icon={<ScheduleIcon variant='schedule-execution' />} className='mr-4' />
          <AdminDetailField
            label="Execution"
            value={notification && (notification.executionId || '-')}
            href={notification && (notification.executionId ? `/admin/schedule-executions/${notification.executionId}` : null)}
          />
        </div>
      </AdminDetailGroup>
   </Card>
  );
}

