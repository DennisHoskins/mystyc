'use client';

import { useState, useEffect, useCallback } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { getUser } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import UserIcon from '@/components/admin/ui/icons/UserIcon'

export default function UserInfoCard({ firebaseUid }: { firebaseUid: string | null }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!firebaseUid) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getUser({deviceInfo: getDeviceInfo(), firebaseUid});
      setUser(data);
    } catch (err) {
      logger.error('Failed to load user:', err);
      setError('Failed to load user. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div>{error}</div>
    )
  }

  if (!user) {
    return (
      <div>User not found</div>
    )
  }

  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return roles.join(', ');
  };

  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={<UserIcon userProfile={user} />} />
        <div>
          <Heading level={5}>{user.fullName || 'Unknown User'}</Heading>
        </div>
      </div>

      <hr />

      <AdminDetailGroup cols={1} className='mt-4'>
        <AdminDetailField
          label="Firebase Uid"
          value={user.firebaseUid}
          href={`/admin/users/${user.firebaseUid}`}
        />
        <AdminDetailField
          label="Contact Information"
          value={user.email}
          href={`/admin/users/${user.firebaseUid}`}
        />
        <AdminDetailField
          label="Roles"
          value={formatUserRoles(user.roles)}
        />
      </AdminDetailGroup>
    </div>
  );
}