'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import UserIcon from '@/components/admin/ui/icons/UserIcon';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import UserDetailsPanel from './UserDetailsPanel';
import UserProfilePanel from './UserProfilePanel';
import UserSubscriptionCard from './UserSubscriptionCard';
import UserTabCard from './UserTabCard';

export default function UserPage({ firebaseUid }: { firebaseUid: string }) {
  const { setBusy } = useBusy();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await apiClientAdmin.users.getUser(firebaseUid);
      setUser(data);
    } catch (err) {
      logger.error('Failed to load user:', err);
      setError('Failed to load user. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [firebaseUid, setBusy]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: user ? `${user.fullName || user.email}` : `${firebaseUid}`},
  ], [user, firebaseUid]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadUser}
      breadcrumbs={breadcrumbs}
      icon={<UserIcon size={6} userProfile={user} />}
      title={user && user.fullName ? user.fullName : `Unknown User`}
      headerContent={<UserDetailsPanel user={user} />}
      sectionsContent={[<UserSubscriptionCard key='subscriptions' user={user} />]}
      sidebarContent={<UserProfilePanel user={user} />}
      mainContent={<UserTabCard firebaseUid={user && user.firebaseUid} />}
    />
  );    
}