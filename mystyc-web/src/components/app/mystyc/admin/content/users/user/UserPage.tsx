'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import UserIcon from '@/components/app/mystyc/admin/ui/icons//UserIcon';
import UserDetailsPanel from './UserDetailsPanel';
import UserProfilePanel from './UserProfilePanel';
import UserDevicesPanel from './UserDevicesPanel';
import UserTabPanel from './UserTabPanel';

export default function UserPage({ firebaseUid }: { firebaseUid: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUser = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getUser(firebaseUid);
      setUser(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load user:', err);
        setError('Failed to load user. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [firebaseUid, setBusy, handleSessionError]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { 
      label: user ? `${user.fullName || user.email}` : `${firebaseUid}`
    },
  ], [user, firebaseUid]);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <AdminItemLayout
        error={'User Not Found'}
        onRetry={loadUser}
        breadcrumbs={breadcrumbs}
        icon={<UserIcon size={6}/>}
        title={'Unknown User'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadUser}
      breadcrumbs={breadcrumbs}
      icon={<UserIcon size={6}/>}
      title={user && user.fullName ? user.fullName : `Unknown User`}
      headerContent={<UserDetailsPanel user={user} />}
      sectionsContent={[
        <Card key='devices' className='h-[22rem]'>
          <UserDevicesPanel firebaseUid={user && user.firebaseUid} />
        </Card>
      ]}
      sidebarContent={<UserProfilePanel user={user} />}
      mainContent={<UserTabPanel firebaseUid={user && user.firebaseUid} />}
    />
  );    
}