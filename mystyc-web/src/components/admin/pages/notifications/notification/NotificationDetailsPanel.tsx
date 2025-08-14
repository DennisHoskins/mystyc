import { Notification } from 'mystyc-common/schemas';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function NotificationDetailsPanel({ notification }: { notification?: Notification | null }) {
  return (
    <AdminDetailGrid cols={2}>
      <AdminDetailField
        label="type"
        value={notification?.type}
      />
      <AdminDetailField
        label="Source"
        value={notification?.source}
      />
      <AdminDetailField
        label="Status"
        value={notification?.status}
      />
      <AdminDetailField
        label="Sent"
        value={notification &&(notification.sentAt ? formatTimestampForComponent(new Date(notification.sentAt).getTime()) : '-')}
      />
        <AdminDetailField
          label="Title"
          value={notification?.title}
        />
        <AdminDetailField
          label="Body"
          value={notification?.body}
        />
        <AdminDetailField
          label="Url"
          value={notification && 'https://mystyc.app'}
          href={notification && 'https://mystyc.app'}
        />
        <AdminDetailField
          label="Content Id"
          value={notification?.contentId ? notification.contentId : "-"}
          href={notification?.contentId && `/admin/content/${notification?.contentId}`}
        />
    </AdminDetailGrid>
  );
}