import { Session } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function SessionDetailsPanel({ session }: { session?: Session | null }) {
  return (
    <AdminDetailGrid cols={2}>
      <Panel padding={4}>
        <AdminDetailField
          label="Created"
          value={(session && session.createdAt) ? formatTimestampForComponent(session.createdAt) : ""}
        />
      </Panel>
      <Panel padding={4}>
        <AdminDetailField
          label="Last Update"
          value={(session && session.lastUpdated) ? formatTimestampForComponent(session.lastUpdated) : ""}
        />
      </Panel>
    </AdminDetailGrid>
  );
}