'use client';

import { Notification } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';

export default function NotificationDetailsPanel({ notification}: { notification: Notification }) {
  return (
    <>
      <hr />

      <div className="grid grid-cols-2 gap-6 pt-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Created"
            value={notification.createdAt ? formatTimestampForComponent(new Date(notification.createdAt).getTime()) : '-'}
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
          <AdminDetailField
            label="Sent"
            value={notification.sentAt ? formatTimestampForComponent(new Date(notification.sentAt).getTime()) : '-'}
          />
        </AdminDetailGroup>
     </div>
    </>
  );
}