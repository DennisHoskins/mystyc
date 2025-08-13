'use client'

import { useEffect, useCallback, useState } from 'react';

import { Notification } from 'mystyc-common/schemas';
import { getUserNotifications } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon'
import Capsule from '@/components/ui/Capsule';
import { formatDateForComponent } from '@/util/dateTime';

export default function UserNotificationCard({ firebaseUid, total }: { firebaseUid?: string | null, total: number | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserNotifications = useCallback(async () => {
    try {
      if (!firebaseUid) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 11;
      const response = await getUserNotifications({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});

      setNotifications(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    }
  }, [firebaseUid]);

  useEffect(() => {
      loadUserNotifications();
  }, [hasLoaded, loadUserNotifications]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load notifications'
        error={error}
        onRetry={() => loadUserNotifications()}
      />
    )
  }

  return (
    <Card className='flex flex-col space-y-2'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={NotificationIcon} />
        <Link href={`/admin/users/${firebaseUid}/notifications`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Notifications</Heading>
        </Link>          
      </div>
      {total &&
        <>
          <hr/ >
          {notifications.map((notification) => (
            <Link 
              key={notification._id} 
              href={`/admin/notifications/${notification._id}`}
              className="flex !flex-row items-center space-x-4"
            >
              <Avatar size={'medium'} icon={(props) => <NotificationIcon {...props} />} />
              <div className='overflow-hidden !mt-0'>
                <Heading level={4}>{notification.type}</Heading>
                <Heading level={5}>Title: {notification.title}</Heading>
                <Capsule label={formatDateForComponent(notification.sentAt)} />
              </div>
            </Link>
          ))}
          {total > notifications.length && <Capsule label={'Total ' + total} href={`/admin/users/${firebaseUid}/notifications`} />}
        </>
      }
    </Card>
  );
}