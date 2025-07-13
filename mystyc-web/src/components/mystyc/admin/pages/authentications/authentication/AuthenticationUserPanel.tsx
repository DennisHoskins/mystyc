'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { logger } from '@/util/logger';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';
import UserIcon from '@/components/mystyc/admin/ui/icons/UserIcon'

export default function UserInfoPanel({ firebaseUid }: { firebaseUid: string | null }) {
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

      const data = await apiClientAdmin.getUser(firebaseUid);
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
        <Avatar size={'small'} icon={UserIcon} />
        <div>
          <Heading level={5}>{user.fullName || 'Unknown User'}</Heading>
        </div>
      </div>

      <hr />

      <div className="pt-4">
        <AdminDetailGroup>
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
    </div>
  );
}