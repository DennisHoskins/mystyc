'use client'

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas';
import { getUserAuthEvents } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon'
import Text from '@/components/ui/Text';
import { formatDateForComponent } from '@/util/dateTime';
import Capsule from '@/components/ui/Capsule';

export default function UserAuthEventCard({ firebaseUid, total }: { firebaseUid?: string | null, total: number | null }) {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserAuthEvents = useCallback(async () => {
    try {
      if (!firebaseUid) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getUserAuthEvents({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});

      setAuthEvents(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load auth events:', err);
      setError('Failed to load auth events. Please try again.');
    }
  }, [firebaseUid]);

  useEffect(() => {
      loadUserAuthEvents();
  }, [hasLoaded, loadUserAuthEvents]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load auth events'
        error={error}
        onRetry={() => loadUserAuthEvents()}
      />
    )
  }

  return (
    <Card className='flex flex-col space-y-2 flex-1'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={AuthenticationIcon} />
        <Link href={`/admin/users/${firebaseUid}/auth-events`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Auth Events</Heading>
        </Link>          
      </div>
      {total &&
        <>
          <hr/ >
          <div className='space-y-4'>
            {authEvents.map((authEvent) => (
              <Link 
                key={authEvent._id} 
                href={`/admin/authentication/${authEvent._id}`}
                className="flex !flex-row items-center space-x-4"
              >
                <div className='overflow-hidden !mt-0'>
                  <div className='flex space-x-1 items-baseline'>
                    <Heading level={4}>{authEvent.type}</Heading>
                    <Heading level={6}>{authEvent.deviceName}</Heading>
                  </div>
                  <Text className='!text-[10px]'>{formatDateForComponent(authEvent.timestamp)}</Text>
                </div>
              </Link>
            ))}
            {total > authEvents.length && <Capsule label={'Total ' + total} href={`/admin/auth-events/${firebaseUid}/devices`} />}
          </div>
        </>
      }
    </Card>
  );
}