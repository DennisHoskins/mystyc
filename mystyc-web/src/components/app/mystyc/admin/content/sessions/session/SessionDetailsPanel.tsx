'use client';

import { Session } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';

export default function SessionDetailsPanel({ session }: { session: Session }) {
  return (
    <div className='min-h-10'>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Created"
            value={formatTimestampForComponent(session.createdAt)}
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
          <AdminDetailField
            label="Last Update"
            value={formatTimestampForComponent(session.createdAt)}
          />
        </AdminDetailGroup>
      </div>
    </div>
  );
}