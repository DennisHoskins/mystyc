import { Device } from 'mystyc-common/schemas/';
import { Session } from '@/interfaces';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';
import AdminCard from '@/components/admin/ui/AdminCard';
import Panel from '@/components/ui/Panel';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import TokensIcon from '@/components/admin/ui/icons/TokensIcon';

export default function DeviceTokensCard({ session, device }: { session?: Session | null, device?: Device | null }) {
  return (
    <AdminCard
      icon={<TokensIcon />}
      title='Tokens'
      className='flex-1 grow'
    >
      <Panel padding={4}>
        <AdminDetailField
          label="Auth Token"
          value={session?.authToken}
          text={(session && session.authTokenTimestamp) ? formatTimestampForComponent(session.authTokenTimestamp) : ""}
        />
      </Panel>
      <Panel padding={4} className='!mt-2'>
        <AdminDetailField
          label="Refresh Token"
          value={session?.refreshToken}
          text={(session && session.refreshTokenTimestamp) ? formatTimestampForComponent(session.refreshTokenTimestamp) : ""}
        />
      </Panel>
      {device && device.fcmToken &&
        <Panel padding={4} className='!mt-2'>
            <AdminDetailField
              label="FcmToken"
              value={device && device.fcmToken ? device.fcmToken : ''}
              text={device && device.fcmToken && device.fcmTokenUpdatedAt ? formatDateForComponent(device.fcmTokenUpdatedAt) : ''}
            />
        </Panel>
      }
    </AdminCard>
  );
}