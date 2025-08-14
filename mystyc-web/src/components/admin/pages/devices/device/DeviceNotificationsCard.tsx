'use client'

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { getDeviceNotifications } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Link from '@/components/ui/Link';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import { formatDateForComponent } from '@/util/dateTime';
import { formatStringForDisplay } from '@/util/util';

export default function DeviceNotificationsCard({ deviceId, total }: { deviceId?: string | null, total?: number | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDeviceNotifications = useCallback(async () => {
    try {
      if (!deviceId) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getDeviceNotifications({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

      setNotifications(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    }
  }, [deviceId]);

  useEffect(() => {
      loadDeviceNotifications();
  }, [hasLoaded, loadDeviceNotifications]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load notifications'
        error={error}
        onRetry={() => loadDeviceNotifications()}
      />
    )
  }

  return (
    <Card>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={NotificationIcon} />
        <Link href={`/admin/devices/${deviceId}/notifications`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Notifications</Heading>
        </Link>          
      </div>
      {total ? (
        <>
          <hr/ >
          <div className='flex flex-col space-y-4 pt-1'>
            {notifications.map((notification) => (
              <Link 
                key={notification._id} 
                href={`/admin/notifications/${notification._id}`}
                className="flex !flex-row items-center space-x-4"
              >
                <div className='overflow-hidden'>
                  <Heading level={6}>{formatStringForDisplay(notification.type)} - {notification.title}</Heading>
                  <Text variant='xs'>{formatDateForComponent(notification.sentAt ? notification.sentAt : notification.createdAt)}</Text>
                </div>
              </Link>
            ))}
          </div>        
        </>
      ) : null}
    </Card>
  );
}