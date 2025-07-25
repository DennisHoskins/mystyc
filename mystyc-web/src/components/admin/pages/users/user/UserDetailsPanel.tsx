'use client';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';

import { formatDateForDisplay } from '@/util/dateTime';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function UserDetailsPanel({ user }: { user: UserProfile }) {
  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.join(', ');
  };

  return (
    <AdminDetailGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AdminDetailField
        label="Firebase Uid"
        value={user.firebaseUid}
      />
      <AdminDetailField
        label="Contact Information"
        value={user.email}
      />
      <AdminDetailField
        label="Roles & Permissions"
        value={formatUserRoles(user.roles)}
      />
      <AdminDetailField
        label="Account Created"
        value={formatDateForDisplay(user.createdAt)}
      />
      <AdminDetailField
        label="Last Updated"
        value={formatDateForDisplay(user.updatedAt)}
      />
    </AdminDetailGroup>
  );
}