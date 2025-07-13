'use client';

import { Session, Device } from '@/interfaces';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/mystyc/admin/ui/detail/AdminDetailField';
import AdminDetailGrid from '@/components/mystyc/admin/ui/detail/AdminDetailGrid';
import TokensIcon from '@/components/mystyc/admin/ui/icons/TokensIcon';

export default function DeviceTokensPanel({ session, device }: { session: Session, device?: Device | null }) {
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
        <AdminDetailGrid>
          <AdminDetailGroup>
            <AdminDetailField
              label="Auth Token"
              value={session.authToken}
              text={formatTimestampForComponent(session.authTokenTimestamp)}
            />
          </AdminDetailGroup>
          <AdminDetailGroup>
            <AdminDetailField
              label="Refresh Token"
              value={session.refreshToken}
              text={formatTimestampForComponent(session.refreshTokenTimestamp)}
            />
          </AdminDetailGroup>
          <AdminDetailGroup>
              <AdminDetailField
                label="FcmToken"
                value={device && device.fcmToken ? device.fcmToken : ''}
                text={device && device.fcmToken && device.fcmTokenUpdatedAt ? formatDateForComponent(device.fcmTokenUpdatedAt) : ''}
              />
            </AdminDetailGroup>
        </AdminDetailGrid>
      </div>
    </div>
  );
}