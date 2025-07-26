import { Session } from '@/interfaces';

import { formatTimestampForComponent } from '@/util/dateTime';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SessionDetailsPanel({ session }: { session?: Session | null }) {
  return (
      <AdminDetailGroup cols={2}>
        <AdminDetailField
          label="Created"
          value={session && formatTimestampForComponent(session.createdAt)}
        />
        <AdminDetailField
          label="Last Update"
          value={session && formatTimestampForComponent(session.createdAt)}
        />
      </AdminDetailGroup>
  );
}