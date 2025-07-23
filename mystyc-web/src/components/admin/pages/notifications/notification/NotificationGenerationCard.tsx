import { Notification } from 'mystyc-common/schemas';

import Card from '@/components/ui/Card';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function NotificationGenerationCard({ notification }: { notification: Notification }) {
  if (!notification.scheduleId && !notification.executionId) {
    return;
  }

  return (
    <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <AdminDetailGroup>
        <AdminDetailField
          label="Schedule"
          value={notification.scheduleId || '-'}
          href={notification.scheduleId ? `/admin/schedules/${notification.scheduleId}` : null}
        />
      </AdminDetailGroup>
      <AdminDetailGroup>
        <AdminDetailField
          label="Execution"
          value={notification.executionId || '-'}
          href={notification.executionId ? `/admin/schedules/${notification.executionId}` : null}
        />
      </AdminDetailGroup>
   </Card>
  );
}