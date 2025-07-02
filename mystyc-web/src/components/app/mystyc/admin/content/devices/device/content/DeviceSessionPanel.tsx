'use client';

import { DeviceSession } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import SessionIcon from '@/components/app/mystyc/admin/ui/icons/SessionIcon';

export default function DeviceSessionPanel({ deviceSession }: { deviceSession: DeviceSession }) {


  if (!deviceSession.session && deviceSession.device.fcmToken) {
    return (
      <div className='flex flex-col'>
        <div className="flex items-center space-x-2">
          <Avatar size={'small'} icon={SessionIcon} />
          <div>
            <Heading level={5}>Session</Heading>
          </div>
        </div>

        <div className="pt-4">
          <AdminDetailGroup>
            <AdminDetailField
              label="Fcm Token"
              value={deviceSession.device.fcmToken || 'Not set'}
//              text={formatTimestampForComponent(deviceSession.device.fcmTokenTimestamp)}
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
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={SessionIcon} />
        <div>
          <Heading level={5}>Session</Heading>
        </div>
      </div>

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
            value={deviceSession.session.fcmToken || 'Not set'}
            text={formatTimestampForComponent(deviceSession.session.fcmTokenTimestamp)}
          />
        </AdminDetailGroup>
      </div>
    </div>
  );
}