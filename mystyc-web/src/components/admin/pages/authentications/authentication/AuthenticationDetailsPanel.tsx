import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function AuthenticationDetailsPanel({ authentication }: { authentication: AuthEvent | null }) {
  return (
    <AdminDetailGrid cols={3}>
      <AdminDetailField
        label="TCP/IP Address"
        value={authentication?.ip}
      />
      <AdminDetailField
        label="Created"
        value={formatDateForComponent(authentication?.createdAt)}
      />
      <AdminDetailField
        label="Sent"
        value={authentication 
          ? authentication.clientTimestamp ? formatTimestampForComponent(new Date(authentication.clientTimestamp).getTime()) : '-'
          : ""
        }
      />
    </AdminDetailGrid>
  );
}