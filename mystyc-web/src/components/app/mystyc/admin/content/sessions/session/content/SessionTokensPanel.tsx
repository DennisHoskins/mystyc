'use client';

import { Session } from '@/interfaces';
import { formatTimestampForComponent } from '@/util/dateTime';

import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import AdminDetailGrid from '@/components/app/mystyc/admin/ui/detail/AdminDetailGrid';
import TokensIcon from '@/components/app/mystyc/admin/ui/icons/TokensIcon';

export default function DeviceTokensPanel({ session }: { session: Session }) {
  return (
    <div className='flex flex-col'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={TokensIcon} />
        <div>
          <Heading level={5}>Tokens</Heading>
        </div>
      </div>

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
              label="Fcm Token"
              value={session.fcmToken || 'Not set'}
              text={formatTimestampForComponent(session.fcmTokenTimestamp)}
            />
          </AdminDetailGroup>
        </AdminDetailGrid>
      </div>
    </div>
  );
}