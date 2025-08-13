'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Device } from 'mystyc-common/schemas/';
import { Session } from '@/interfaces';
import { getSession } from '@/server/actions/admin/sessions';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import UserProfileIcon from '@/components/admin/ui/icons/UserProfileIcon';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionDetailsPanel from './SessionDetailsPanel';
import SessionTokensCard from './SessionTokensCard';
import UserInfoPanel from '@/components/admin/pages/users/user/UserInfoPanel';
import DeviceInfoPanel from '@/components/admin/pages/devices/device/DeviceInfoPanel';

export default function SessionPage({ sessionId }: { sessionId: string }) {
  const { setBusy } = useBusy();
  const [session, setSession] = useState<Session | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getSession({deviceInfo: getDeviceInfo(), sessionId});
      setSession(data);
    } catch (err) {
      logger.error('Failed to load session:', err);
      setError('Failed to load session. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [sessionId, setBusy]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions', href: '/admin/sessions' },
    { label: session ? `${sessionId}` : `` },
  ], [session, sessionId]);

  const handleDeviceLoad = useCallback((device: Device) => {
    setDevice(device);
  }, []);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadSession}
      breadcrumbs={breadcrumbs}
      icon={<SessionIcon />}
      title={session ? `${session.email} - ${session.deviceName}` : ""}
      headerContent={<SessionDetailsPanel session={session} />}
      sideContent={
        <div className='flex flex-col space-y-2'>
          <div className='flex space-x-2'>
            <Avatar size={'small'} icon={UserProfileIcon} />
            <Heading level={3}>User</Heading>
          </div>
          <hr/ >
          <div className='flex flex-col space-y-6'>
            <UserInfoPanel key='user' firebaseUid={session?.uid} />
            <DeviceInfoPanel key='device' deviceId={session?.deviceId} onLoad={handleDeviceLoad} />
          </div>
        </div>
      }
      itemsContent={[<SessionTokensCard key='tokens' session={session} device={device} />]}
    />
  );    
}