import { Session } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function SessionDetailsPanel({ session }: { session?: Session | null }) {
  return (
      <AdminDetailGrid cols={2}>
        <AdminDetailField
          label="Created"
          value={(session && session.createdAt) ? formatTimestampForComponent(session.createdAt) : ""}
        />
        <AdminDetailField
          label="Last Update"
          value={(session && session.lastUpdated) ? formatTimestampForComponent(session.lastUpdated) : ""}
        />
      </AdminDetailGrid>
  );
}