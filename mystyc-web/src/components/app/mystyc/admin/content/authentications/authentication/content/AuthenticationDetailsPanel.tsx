'use client';

import { AuthEvent } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';

export default function AuthenticationDetailsPanel({ authentication}: { authentication: AuthEvent }) {
  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        <AdminDetailGroup>
          <AdminDetailField
            label="Type"
            value={authentication.type}
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
          <AdminDetailField
            label="Sent"
            value={authentication.clientTimestamp ? formatTimestampForComponent(new Date(authentication.clientTimestamp).getTime()) : '-'}
          />
        </AdminDetailGroup>
        <AdminDetailGroup>
          <AdminDetailField
            label="TCP/IP Address"
            value={authentication.ip}
          />
        </AdminDetailGroup>
     </div>
    </>
  );
}