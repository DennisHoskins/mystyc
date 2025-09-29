'use client'

import { useState, useEffect, useCallback } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { getUser } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import UserIcon from '@/components/admin/ui/icons/UserIcon'
import { formatDateForDisplay, formatTimeForDisplay } from '@/util/dateTime';

export default function UserCard({ firebaseUid, className }: { firebaseUid?: string | null, className?: string }) {
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

  const formatUserName = (user: UserProfile) => {
    if (!user.firstName && !user.lastName) return user.firebaseUid;
    return user.firstName + " " + user.lastName;
  }

  const formatUserRoles = (roles: string[]) => {
    if (!roles || roles.length === 0) return 'No roles assigned';
    return "[" + roles.join(', ') + "]";
  };

  return (
    <AdminCard
      icon={<UserIcon userProfile={user} />}
      title={formatUserName(user)}
      href={`/admin/users/${firebaseUid}`}
      className={className}
    >
      <Panel padding={4}>
        <AdminDetailGrid>
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
          <AdminDetailField
            label="Subscription"
            value={user.subscription.level}
          />
          <AdminDetailField
            label="First Name"
            value={user.firstName}
          />
          <AdminDetailField
            label="Last Name"
            value={user.lastName}
          />
          <AdminDetailField
            label="Birth Location"
            value={user.birthLocation?.name}
          />
          <AdminDetailField
            label="Birth Date"
            value={formatDateForDisplay(user.dateOfBirth)}
          />
          <AdminDetailField
            label="Birth Time"
            value={user.timeOfBirth ? formatTimeForDisplay(user.timeOfBirth) : 'Not Set'}
          />
          <AdminDetailField
            label="Birth TimeZone"
            value={user.birthLocation?.timezone.name}
          />
          <AdminDetailField
            label="Zodiac Sign"
            value={user.astrology?.sun.sign || 'Not Set'}
            href={`/admin/users/${firebaseUid}/astrology`}
          />
        </AdminDetailGrid>
      </Panel>
    </AdminCard>
  );
}