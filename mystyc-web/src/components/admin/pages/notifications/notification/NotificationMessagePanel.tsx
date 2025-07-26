import { Notification } from 'mystyc-common/schemas';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import MessageIcon from '@/components/admin/ui/icons/MessageIcon';

export default function NotificationMessagePanel({ notification }: { notification?: Notification | null }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={MessageIcon} />
        <div>
          <Heading level={5}>Message</Heading>
        </div>
      </div>

      <hr />

      <div className="pt-4">
        <AdminDetailGroup cols={1}>
          {notification?.contentId &&
            <AdminDetailField
              label="Content Id"
              value={notification?.contentId}
              href={notification && (`/admin/content/${notification?.contentId}`)}
            />
          }
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
        </AdminDetailGroup>
      </div>
    </div>
  );
}