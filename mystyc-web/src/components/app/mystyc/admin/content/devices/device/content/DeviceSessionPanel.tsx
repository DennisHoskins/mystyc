'use client';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { DeviceSession } from '@/interfaces';
import { useBusy, useToast } from '@/components/layout/context/AppContext';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import SessionIcon from '@/components/app/mystyc/admin/ui/icons/SessionIcon';
import Button from '@/components/ui/Button';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon'

export default function DeviceSessionPanel({ deviceSession }: { deviceSession: DeviceSession }) {
  const { setBusy } = useBusy();
  const showToast = useToast();

  const sendNotification = async () => {
    setBusy(true);
    try {
      const results = await apiClientAdmin.sendNotification(
        deviceSession.device.deviceId,
        'Message from Mystyc Admin',
        'You are beautiful'
      );
      setBusy(false);

      if (results.success) {
        showToast('Notification sent', 'success');
      } else {
        console.error("Error sending Notification", results);
        showToast('Error sending Notification', 'error');
      }
    } catch(err) {
      console.error("Error sending Notification", err);
      showToast('Error sending Notification', 'error');
    } finally {
      setBusy(false);
    }
  }  

  if (!deviceSession.session && deviceSession.device.fcmToken) {
    return (
      <div className='flex flex-col'>
        <div className="flex items-center space-x-2">
          <Avatar size={'small'} icon={SessionIcon} />
            <Heading level={5} className='flex-1'>Session</Heading>

            <Button
              onClick={sendNotification}
              className='flex justify-center items-center'
              disabled={deviceSession.device.fcmToken == null}
            >
              <NotificationIcon size={4} className='text-white'/>
              <span className='hidden xl:block ml-2'>Send Notification</span>
            </Button>
        </div>

        <div className="pt-4">
          <AdminDetailGroup>
            <AdminDetailField
              label="Fcm Token"
              value={deviceSession.device.fcmToken || 'Not set'}
              text={deviceSession.device.fcmToken && deviceSession.device.fcmTokenUpdatedAt ? formatDateForComponent(deviceSession.device.fcmTokenUpdatedAt) : '-'}
            />
          </AdminDetailGroup>
        </div>
      </div>
    );
  }

  if (!deviceSession.session) {
    return (
      <div className='flex flex-col'>
        <div className="flex items-center space-x-2">
          <Avatar size={'small'} icon={SessionIcon} />
          <div>
            <Heading level={5}>Session</Heading>
          </div>
        </div>

        <div className="pt-4">
          <Text>Unable to load Session</Text>
        </div>
      </div>
    );
  }
  
  return (
    <div className='flex flex-col'>
      <div className="pt-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="User"
            value={deviceSession.session.email}
            href={`/admin/users/${deviceSession.session.uid}`}
            text={deviceSession.session.uid}
          />
          <AdminDetailField
            label="Session Id"
            value={deviceSession.session.sessionId}
            href={`/admin/sessions/${deviceSession.session.sessionId}`}
            text={formatTimestampForComponent(deviceSession.session.createdAt)}
          />
          <AdminDetailField
            label="Auth Token"
            value={deviceSession.session.authToken}
            text={formatTimestampForComponent(deviceSession.session.authTokenTimestamp)}
          />
          <AdminDetailField
            label="Refresh Token"
            value={deviceSession.session.refreshToken}
            text={formatTimestampForComponent(deviceSession.session.refreshTokenTimestamp)}
          />
          <AdminDetailField
            label="Fcm Token"
            value={deviceSession.device.fcmToken || 'Not set'}
            text={deviceSession.device.fcmToken && deviceSession.device.fcmTokenUpdatedAt ? formatDateForComponent(deviceSession.device.fcmTokenUpdatedAt) : '-'}
          />
        </AdminDetailGroup>
      </div>
    </div>
  );
}