import { Device } from 'mystyc-common/schemas/';
import { Session } from '@/interfaces';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import TokensIcon from '@/components/admin/ui/icons/TokensIcon';

export default function DeviceTokensCard({ session, device }: { session?: Session | null, device?: Device | null }) {
  return (
    <Card className='flex flex-col flex-1 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={TokensIcon} />
        <div>
          <Heading level={5}>Tokens</Heading>
        </div>
      </div>
      <hr />
      <AdminDetailGrid cols={1}>
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
      </AdminDetailGrid>
    </Card>
  );
}