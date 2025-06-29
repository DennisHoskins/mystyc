'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout'
import UserDetailsPanel from './UserDetailsPanel';
import UserProfilePanel from './UserProfilePanel';
import UserDevicesPanel from './UserDevicesPanel';
import UserTabPanel from './UserTabPanel';

export default function UserPage({ firebaseUid }: { firebaseUid: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
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

  // Generate breadcrumbs with user info
  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { 
      label: user ? `${firebaseUid}` : ``
    },
  ], [user, firebaseUid]);

  return (
    <AdminItemLayout
      breadcrumbs={breadcrumbs}
      title={user && user.fullName ? user.fullName : `Unknown User`}
      headerContent={
        <UserDetailsPanel
          user={user}
          error={error}
          loading={loading}
          onRetry={loadUser}
        />
      }
      mainContent={
        <UserDevicesPanel firebaseUid={user && user.firebaseUid} />
      }
      sidebarContent={
        <UserProfilePanel user={user} />
      }
      tabsContent={
        <UserTabPanel firebaseUid={user && user.firebaseUid} />
      }
    />
  );    
}