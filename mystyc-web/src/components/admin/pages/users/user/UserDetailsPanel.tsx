import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function UserDetailsPanel({ user }: { user?: UserProfile | null }) {
  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return "[" + roles.join(', ') + "]";
  };

  return (
    <div className='space-y-4 flex-1 grow'>
      <AdminDetailGrid cols={3}>
        <Panel padding={4}>
          <AdminDetailField
            label="Firebase Uid"
            value={user?.firebaseUid}
          />
          <AdminDetailField
            label="Contact Information"
            value={user?.email}
          />
        </Panel>
        <Panel padding={4}>
          <AdminDetailField
            label="Roles & Permissions"
            value={user && formatUserRoles(user.roles)}
          />
          <AdminDetailField
            label="Subscription Level"
            value={user?.subscription.level}
          />
        </Panel>
        <Panel padding={4}>
          <AdminDetailField
            label="Account Created"
            value={formatDateForDisplay(user?.createdAt)}
          />
          <AdminDetailField
            label="Last Updated"
            value={formatDateForDisplay(user?.updatedAt)}
          />
        </Panel>
      </AdminDetailGrid>
    </div>
  );
}