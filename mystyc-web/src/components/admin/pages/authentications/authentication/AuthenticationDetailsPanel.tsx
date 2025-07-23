import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';

import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function AuthenticationDetailsPanel({ authentication }: { authentication: AuthEvent }) {
  return (
    <div className='min-h-10'>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
    </div>
  );
}