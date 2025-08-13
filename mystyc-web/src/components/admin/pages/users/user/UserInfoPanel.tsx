'use client'

import { useState, useEffect, useCallback } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { getUser } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import UserIcon from '@/components/admin/ui/icons/UserIcon';

export default function UserInfoPanel({ firebaseUid }: { firebaseUid?: string | null }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      if (!firebaseUid) {
        return;
      }
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

  if (loading || !user) {
    return (
      <div className="flex items-center space-x-4">
        <Avatar size={'medium'} icon={<UserIcon userProfile={user} />} />
        <div>
          <Heading level={5}>Loading User...</Heading>
          <Heading level={6}>Firebase Uid:</Heading>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center space-x-4">
        <Avatar size={'medium'} icon={<UserIcon userProfile={user} />} />
        <div>
          <Heading level={5} className='text-red-400'>{error}</Heading>
          <Heading level={6}>Unable to load User</Heading>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Avatar size={'medium'} icon={<UserIcon userProfile={user} />} />
        <div>
          <Heading level={5} className='text-red-400'>User not found</Heading>
          <Heading level={6}>Unable to load User</Heading>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Avatar size={'medium'} icon={<UserIcon userProfile={user} />} />
      <div className='overflow-hidden'>
        <Heading level={5}>{(user.firstName && user.lastName) ? user.firstName + " " + user.lastName :  'Unknown User'}</Heading>
        <Heading level={6}>FirebaseUid: <Link href={`/admin/users/${user.firebaseUid}`}>{user.firebaseUid}</Link></Heading>
      </div>
    </div>
  );
}