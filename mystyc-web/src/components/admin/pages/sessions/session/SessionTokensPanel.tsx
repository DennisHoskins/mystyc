import { Device } from 'mystyc-common/schemas/';
import { Session } from '@/interfaces';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import TokensIcon from '@/components/admin/ui/icons/TokensIcon';

export default function DeviceTokensPanel({ session, device }: { session?: Session | null, device?: Device | null }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2 mb-4">
        <Avatar size={'small'} icon={TokensIcon} />
        <div>
          <Heading level={5}>Tokens</Heading>
        </div>
      </div>

      <hr />

      <div className="pt-4">
        <AdminDetailGroup cols={1}>
          <AdminDetailField
            label="Auth Token"
            value={session?.authToken}
            text={(session && session.authTokenTimestamp) ? formatTimestampForComponent(session.authTokenTimestamp) : ""}
          />
          <AdminDetailField
            label="Refresh Token"
            value={session?.refreshToken}
            text={(session && session.refreshTokenTimestamp) ? formatTimestampForComponent(session.refreshTokenTimestamp) : ""}
          />
            <AdminDetailField
              label="FcmToken"
              value={device && device.fcmToken ? device.fcmToken : ''}
              text={device && device.fcmToken && device.fcmTokenUpdatedAt ? formatDateForComponent(device.fcmTokenUpdatedAt) : ''}
            />
        </AdminDetailGroup>
      </div>
    </div>
  );
}