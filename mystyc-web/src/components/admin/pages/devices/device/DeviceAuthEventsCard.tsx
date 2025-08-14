'use client'

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas';
import { getDeviceAuthEvents } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import Text from '@/components/ui/Text';
import { formatDateForComponent } from '@/util/dateTime';
import { formatStringForDisplay } from '@/util/util';

export default function DeviceAuthEventsCard({ deviceId, total }: { deviceId?: string | null, total?: number | null }) {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDeviceAuthEvents = useCallback(async () => {
    try {
      if (!deviceId) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getDeviceAuthEvents({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

      setAuthEvents(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load auth events:', err);
      setError('Failed to load auth events. Please try again.');
    }
  }, [deviceId]);

  useEffect(() => {
      loadDeviceAuthEvents();
  }, [hasLoaded, loadDeviceAuthEvents]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load authEvents'
        error={error}
        onRetry={() => loadDeviceAuthEvents()}
      />
    )
  }

  return (
    <Card className='flex-1'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={AuthenticationIcon} />
        <Link href={`/admin/devices/${deviceId}/auth-events`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Auth Events</Heading>
        </Link>          
      </div>
      {total ? (
        <>
          <hr/ >
          <div className='flex flex-col space-y-4 pt-1'>
            {authEvents.map((authEvent) => (
              <Link 
                key={authEvent._id} 
                href={`/admin/authEvents/${authEvent._id}`}
                className="flex !flex-row items-center space-x-4"
              >
                <div className='overflow-hidden'>
                  <Heading level={6}>{formatStringForDisplay(authEvent.type.replace("-", " "))} - {authEvent.deviceName}</Heading>
                  <Text variant='xs'>{formatDateForComponent(authEvent.timestamp)}</Text>
                </div>
              </Link>
            ))}
          </div>        
        </>
      ) : null}
    </Card>
  );
}