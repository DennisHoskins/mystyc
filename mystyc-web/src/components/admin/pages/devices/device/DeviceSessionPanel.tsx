import { DeviceSession } from '@/interfaces';

import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';

export default function DeviceSessionPanel({ deviceSession }: { deviceSession?: DeviceSession | null }) {
  if (deviceSession && !deviceSession.session && deviceSession.device.fcmToken) {
    return (
      <>
        <div className='flex flex-col'>
          <div className="flex items-center space-x-2 mb-4">
            <Avatar size={'small'} icon={SessionIcon} />
            <Heading level={5} className='flex-1'>Session</Heading>
          </div>

          <hr />

          <div className="pt-4">
            <AdminDetailGroup cols={1}>
              <AdminDetailField
                label="Fcm Token"
                value={deviceSession.device.fcmToken || 'Not set'}
                text={deviceSession.device.fcmToken && deviceSession.device.fcmTokenUpdatedAt ? formatDateForComponent(deviceSession.device.fcmTokenUpdatedAt) : '-'}
              />
            </AdminDetailGroup>
          </div>
        </div>
      </>
    );
  }

  if (deviceSession && !deviceSession.session) {
    return (
      <>
        <div className='flex flex-col'>
          <div className="flex items-center space-x-2 mb-4">
            <Avatar size={'small'} icon={SessionIcon} />
            <div>
              <Heading level={5}>Session</Heading>
            </div>
          </div>

          <hr />

          <div className="pt-4">
            <Text>Unable to load Session</Text>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={SessionIcon} />
        <Heading level={5} className='flex-1'>Session</Heading>
      </div>

      <hr />

      <AdminDetailGroup cols={1} className="pt-4">
        <AdminDetailField
          label="User"
          value={deviceSession?.session?.email}
          href={deviceSession && deviceSession.session ? `/admin/users/${deviceSession.session.uid}` : null}
          text={deviceSession?.session?.uid}
        />
        <AdminDetailField
          label="Session Id"
          value={deviceSession?.session?.sessionId}
          href={deviceSession && deviceSession.session ? `/admin/sessions/${deviceSession.session.sessionId}` : ''}
          text={deviceSession && deviceSession.session && formatTimestampForComponent(deviceSession.session.createdAt)}
        />
        <AdminDetailField
          label="Auth Token"
          value={deviceSession?.session?.authToken}
          text={deviceSession && deviceSession.session && formatTimestampForComponent(deviceSession.session.authTokenTimestamp)}
        />
        <AdminDetailField
          label="Refresh Token"
          value={deviceSession?.session?.refreshToken}
          text={deviceSession && deviceSession.session && formatTimestampForComponent(deviceSession.session.refreshTokenTimestamp)}
        />
        <AdminDetailField
          label="Fcm Token"
          value={deviceSession?.device.fcmToken || 'Not set'}
          text={deviceSession && deviceSession.device.fcmToken && deviceSession.device.fcmTokenUpdatedAt ? formatDateForComponent(deviceSession.device.fcmTokenUpdatedAt) : '-'}
        />
      </AdminDetailGroup>
    </>
  );
}