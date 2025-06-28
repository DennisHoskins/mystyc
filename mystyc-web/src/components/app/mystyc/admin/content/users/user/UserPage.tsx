'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';
import Text from '@/components/ui/Text';
import UserPanel from './UserPanel';

export default function UserPage({ userId }: { userId: string }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getUser(userId);
      setUser(data);
    } catch (err) {
      logger.error('Failed to load user:', err);
      setError('Failed to load user. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Generate breadcrumbs with user info
  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { 
      label: user ? (user.email || `User ${userId}`) : ``
    },
  ], [user, userId]);

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        title={user && user.fullName ? user.fullName : `Unknown User`}
      >
        <div className="space-y-1 mt-2">
          <Text variant="muted">
            <strong>User ID:</strong> {user && user.id}
          </Text>
          <Text variant="muted">
            <strong>FirebaseUid:</strong> {user && user.firebaseUid}
          </Text>
        </div>
      </AdminHeader>

      <div className="mt-4">
        <UserPanel
          user={user}
          error={error}
          loading={loading}
          onRetry={loadUser}
        />
      </div>
    </>
  );
}