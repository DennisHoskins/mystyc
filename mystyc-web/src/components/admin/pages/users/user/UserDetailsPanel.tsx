'use client';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';

import { formatDateForDisplay } from '@/util/dateTime';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function UserDetailsPanel({ user }: { user?: UserProfile | null }) {
  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return "[" + roles.join(', ') + "]";
  };

  return (
    <div className='space-y-4'>
      <AdminDetailGroup cols={2}>
        <AdminDetailField
          label="Firebase Uid"
          value={user?.firebaseUid}
        />
        <AdminDetailField
          label="Name"
          value={user?.fullName}
        />
        <AdminDetailField
          label="Contact Information"
          value={user?.email}
        />
        <AdminDetailField
          label="Roles & Permissions"
          value={user && formatUserRoles(user.roles)}
        />
        <AdminDetailField
          label="Account Created"
          value={formatDateForDisplay(user?.createdAt)}
        />
        <AdminDetailField
          label="Last Updated"
          value={formatDateForDisplay(user?.updatedAt)}
        />
      </AdminDetailGroup>
    </div>
  );
}