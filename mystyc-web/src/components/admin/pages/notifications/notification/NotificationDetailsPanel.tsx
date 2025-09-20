import { Notification } from 'mystyc-common/schemas';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function NotificationDetailsPanel({ notification }: { notification?: Notification | null }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      <AdminDetailGrid cols={2}>
        <Panel padding={4}>
          <AdminDetailField
            label="Status"
            value={notification &&
              <span className={`font-medium ${getStatusColor(notification.status)}`}>
                {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
              </span>
            }
          />
        </Panel>
        <Panel padding={4}>
          <AdminDetailField
            label="Type / Source"
            value={notification && `${notification?.type} - ${notification?.source}`}
          />
        </Panel>
      </AdminDetailGrid>
      <AdminDetailGrid cols={1} className='mt-4'>
        <Panel padding={4}>
          <AdminDetailField
            label="Title"
            value={notification?.title}
          />
          <AdminDetailField
            label="Body"
            value={notification?.body}
            type='description'
          />
          <AdminDetailField
            label="Url"
            value={notification && 'https://mystyc.app'}
            href={notification && 'https://mystyc.app'}
          />
        </Panel>
      </AdminDetailGrid>
    </>
  );
}