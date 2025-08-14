import { DeviceSession } from '@/interfaces';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';

export default function DeviceSessionCard({ deviceSession }: { deviceSession?: DeviceSession | null }) {
  return (
    <Card className='flex-1'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={SessionIcon} />
        <Heading level={5} className='flex-1'>Session</Heading>
      </div>
      <hr />
      <AdminDetailGrid cols={1} className='pt-1'>
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
          text={deviceSession?.session?.createdAt ? formatTimestampForComponent(deviceSession.session.createdAt) : ""}
        />
        <AdminDetailField
          label="Auth Token"
          value={deviceSession?.session?.authToken}
          text={deviceSession?.session?.authTokenTimestamp ? formatTimestampForComponent(deviceSession.session.authTokenTimestamp) : ""}
        />
        <AdminDetailField
          label="Refresh Token"
          value={deviceSession?.session?.refreshToken}
          text={deviceSession?.session?.refreshTokenTimestamp ? formatTimestampForComponent(deviceSession.session.refreshTokenTimestamp) : ""}
        />
        <AdminDetailField
          label="Fcm Token"
          value={deviceSession?.device.fcmToken || 'Not set'}
          text={deviceSession?.device.fcmTokenUpdatedAt ? formatDateForComponent(deviceSession.device.fcmTokenUpdatedAt) : '-'}
        />
      </AdminDetailGrid>
    </Card>
  );
}