'use client';

import { DeviceSession } from '@/interfaces';
import Heading from '@/components/ui/Heading';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';
import AdminDetailGrid from '../../../ui/detail/AdminDetailGrid';

export default function DeviceSessionPanel({ deviceSession }: { deviceSession?: DeviceSession | null }) {
  if (!deviceSession) {
    return null;
  }

  return (
    <div>
      <Heading level={5} className='mb-4'>Device Session</Heading>
      <AdminDetailGrid>
        <AdminDetailGroup>
          <AdminDetailField
            label="Session Id"
            value={deviceSession.sessionId}
            href={'/admin/sessions/${deviceSession.sessionId}'}
            text={`3 days: 10:04am Tuesday`}
          />
          <AdminDetailField
            label="User"
            value={deviceSession.email}
            href={'/admin/users/${deviceSession.uid}'}
          />
          <AdminDetailField
            label="Auth Token"
            value={deviceSession.authToken}
            text={`20 mins: 10:04am Tuesday`}
          />
          <AdminDetailField
            label="Retry Token"
            value={deviceSession.retryToken}
            text={`1 day: 10:04am Thursday`}
          />
          <AdminDetailField
            label="Fcm Token"
            value={deviceSession.fcmToken || 'Not set'}
            text={`3 days: 10:04am Tuesday`}
          />
        </AdminDetailGroup>
      </AdminDetailGrid>
    </div>
  );
}