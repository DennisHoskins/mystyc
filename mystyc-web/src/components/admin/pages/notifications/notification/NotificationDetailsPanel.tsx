import { Notification } from 'mystyc-common/schemas';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function NotificationDetailsPanel({ notification }: { notification?: Notification | null }) {
  return (
    <AdminDetailGroup cols={2}>
      <AdminDetailField
        label="type"
        value={notification?.type}
      />
      <AdminDetailField
        label="Created"
        value={notification &&(notification.createdAt ? formatTimestampForComponent(new Date(notification.createdAt).getTime()) : '-')}
      />
      <AdminDetailField
        label="Sent"
        value={notification &&(notification.sentAt ? formatTimestampForComponent(new Date(notification.sentAt).getTime()) : '-')}
      />
    </AdminDetailGroup>
  );
}