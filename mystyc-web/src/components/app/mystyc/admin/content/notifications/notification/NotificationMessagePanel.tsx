'use client';


import { Notification } from '@/interfaces';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import MessageIcon from '@/components/app/mystyc/admin/ui/icons/MessageIcon';

export default function NotificationMessagePanel({ notification }: { notification: Notification }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={MessageIcon} />
        <div>
          <Heading level={5}>Message</Heading>
        </div>
      </div>

      <div className="pt-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Message Id"
            value={notification.messageId}
          />
          <AdminDetailField
            label="Title"
            value={notification.title}
          />
          <AdminDetailField
            label="Body"
            value={notification.body}
          />
          <AdminDetailField
            label="Url"
            value={'https://mystyc.app'}
            href={'https://mystyc.app'}
          />
        </AdminDetailGroup>
      </div>
    </div>
  );
}