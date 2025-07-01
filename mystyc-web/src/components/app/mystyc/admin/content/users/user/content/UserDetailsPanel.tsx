'use client';

import { UserProfile } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import Text from '@/components/ui/Text';

export default function UserDetailsPanel({ user }: { user: UserProfile }) {
  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.join(', ');
  };

  return (
    <div className='flex flex-col min-h-36'>
      <hr />

      <Text variant="muted" className='pt-4 mb-2'>
        FirebaseUid: <strong>{user && user.firebaseUid}</strong>
      </Text>

      <div className="grid grid-cols-2 gap-6 pt-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Contact Information"
            value={user.email}
          />
          <AdminDetailField
            label="Roles & Permissions"
            value={formatUserRoles(user.roles)}
          />
        </AdminDetailGroup>

        <AdminDetailGroup>
          <AdminDetailField
            label="Account Created"
            value={formatDateForDisplay(user.createdAt)}
          />
          <AdminDetailField
            label="Last Updated"
            value={formatDateForDisplay(user.updatedAt)}
          />
        </AdminDetailGroup>
      </div>
    </div>
  );
}