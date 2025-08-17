'use client'

import { useEffect, useCallback, useState } from 'react';

import { UserProfile } from 'mystyc-common/schemas';
import { getDeviceUsers } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import UsersCard from '../../../users/UsersCard';

export default function DeviceUsersCard({ deviceId, total }: { deviceId?: string | null, total?: number | null }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDeviceUsers = useCallback(async () => {
    try {
      if (!deviceId) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getDeviceUsers({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

      setUsers(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    }
  }, [deviceId]);

  useEffect(() => {
      loadDeviceUsers();
  }, [hasLoaded, loadDeviceUsers]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load users'
        error={error}
        onRetry={() => loadDeviceUsers()}
      />
    )
  }

  if (!users) {
    return null;
  }

  return (
    <UsersCard 
      users={users} 
      total={total} 
      href={`/admin/devices/${deviceId}/users`}
    />
  );
}