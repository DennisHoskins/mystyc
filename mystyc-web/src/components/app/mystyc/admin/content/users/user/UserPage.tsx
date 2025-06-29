'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import UserDetailsPanel from './UserDetailsPanel';
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
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        title={user && user.fullName ? user.fullName : `Unknown User`}
      >
        <div className="space-y-1 mt-2">
          <UserDetailsPanel
            user={user}
            error={error}
            loading={loading}
            onRetry={loadUser}
          />
        </div>
      </AdminHeader>

      <div className="mt-4">
        <Card>
          <UserDevicesPanel firebaseUid={user && user.firebaseUid} />
        </Card>          
      </div>

      <div className="mt-4">
        <UserTabPanel firebaseUid={user && user.firebaseUid} />
      </div>
    </>
  );
}