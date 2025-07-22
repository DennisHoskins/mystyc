'use client';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Text from '@/components/ui/Text';

export default function UserDetailsPanel({ user }: { user: UserProfile }) {
  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.join(', ');
  };

  return (
    <div className='flex flex-col min-h-36'>
      <div className='flex flex-col space-y-1 mb-4'>
        <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide mr-2">
          Firebase Uid
        </Text>
        <Text variant="muted" className='overflow-hidden text-nowrap overflow-ellipsis'>
          <strong>{user && user.firebaseUid}</strong>
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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