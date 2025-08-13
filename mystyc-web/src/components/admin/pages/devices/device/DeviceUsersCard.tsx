'use client'

import { useEffect, useCallback, useState } from 'react';

import { UserProfile } from 'mystyc-common/schemas';
import { getDeviceUsers } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import UsersIcon from '@/components/admin/ui/icons/UsersIcon';
import Capsule from '@/components/ui/Capsule';
import { formatStringForDisplay } from '@/util/util';

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

  return (
    <Card className='flex flex-col space-y-2'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={UsersIcon} />
        <Link href={`/admin/devices/${deviceId}/users`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Users</Heading>
        </Link>          
      </div>
      {total &&
        <>
          <hr/ >
          <div className='flex flex-col space-y-4'>
            {users.map((user) => (
              <Link 
                key={user.firebaseUid} 
                href={`/admin/users/${user.firebaseUid}`}
                className="flex !flex-row items-center space-x-4"
              >
                <div className='overflow-hidden !mt-0'>
                  <Heading level={5}>{user.email}</Heading>
                  <Heading level={6} className='!text-[10px]'>{user.firebaseUid}</Heading>
                  {user.subscription.level != "user" && <Capsule label={formatStringForDisplay(user.subscription.level)} />}
                </div>
              </Link>
            ))}
            {total > 1 && <Capsule label={'Total ' + total} href={`/admin/devices/${deviceId}/users`} />}
          </div>        
        </>
      }
    </Card>
  );
}