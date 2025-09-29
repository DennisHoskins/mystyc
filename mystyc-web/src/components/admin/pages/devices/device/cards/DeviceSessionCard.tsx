'use client'

import { useState, useEffect, useCallback } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { getUser } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { DeviceSession } from '@/interfaces';
import { formatTimestampForComponent, formatDateForComponent } from '@/util/dateTime';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import AdminCard from '@/components/admin/ui/AdminCard';
import Panel from '@/components/ui/Panel';
import Link from '@/components/ui/Link';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

export default function DeviceSessionCard({ deviceSession }: { deviceSession?: DeviceSession | null }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async (firebaseUid: string) => {
    try {
      const data = await getUser({deviceInfo: getDeviceInfo(), firebaseUid});
      setUser(data);
    } catch (err) {
      logger.error('Failed to load user:', err);
      setError('Failed to load user. Please try again.');
    }
  }, []);

  useEffect(() => {
    if (!deviceSession || !deviceSession.session) {
      return;
    }
    loadUser(deviceSession.session.uid);
  }, [loadUser, deviceSession]);

  if (error) {
    return (
      <AdminCard
        icon={<SessionIcon />}
        title="Session"
        className='flex-1'
      > 
        <div className='flex flex-col w-full min-h-0 items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </AdminCard>
    );
  }
  
  return (
    <AdminCard
      icon={<SessionIcon />}
      title="Session"
      className='flex-1'
    > 
      <AdminDetailGrid>
        <Panel padding={4} className='space-y-4'>
          <AdminDetailField
            label="Session Id"
            value={deviceSession?.session?.sessionId || "Unknown Session"}
            href={deviceSession && deviceSession.session ? `/admin/sessions/${deviceSession.session.sessionId}` : ''}
            text={deviceSession?.session?.createdAt ? formatTimestampForComponent(deviceSession.session.createdAt) : 'Not Set'}
          />
          <AdminDetailField
            label="Auth Token"
            value={deviceSession?.session?.authToken || "Unknown Auth Token"}
            text={deviceSession?.session?.authTokenTimestamp ? formatTimestampForComponent(deviceSession.session.authTokenTimestamp) : 'Not Set'}
          />
          <AdminDetailField
            label="Refresh Token"
            value={deviceSession?.session?.refreshToken || "Unknown Refresh Token"}
            text={deviceSession?.session?.refreshTokenTimestamp ? formatTimestampForComponent(deviceSession.session.refreshTokenTimestamp) : 'Not Set'}
          />
          {deviceSession?.device.fcmToken &&
            <AdminDetailField
              label="Fcm Token"
              value={deviceSession?.device.fcmToken || 'Unknown Fcm Token'}
              text={deviceSession?.device.fcmTokenUpdatedAt ? formatDateForComponent(deviceSession.device.fcmTokenUpdatedAt) : 'Not Set'}
            />
          }
        </Panel>
        <Link 
          key={user?.firebaseUid} 
          href={deviceSession?.session?.uid ? `/admin/users/${user?.firebaseUid}`: null}
          className="flex !flex-row items-center space-x-4"
        >
          <Panel padding={4} className='overflow-hidden'>
            <Heading level={6}>{user?.email || "Unknown User"}</Heading>
            <Text variant='xs'>{user?.firebaseUid || "Unknown User"}</Text>
          </Panel>
        </Link>
      </AdminDetailGrid>
    </AdminCard>
  );
}