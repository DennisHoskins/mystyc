'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Device } from 'mystyc-common/schemas/';
import { Session } from '@/interfaces';
import { getSession } from '@/server/actions/admin/sessions';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionDetailsPanel from './SessionDetailsPanel';
import SessionTokensCard from './SessionTokensCard';
import UserCard from '../../users/user/UserCard';
import DeviceCard from '../../devices/device/DeviceCard';

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
      if (data) {
        const device = await getDevice({deviceInfo: getDeviceInfo(), deviceId: data?.deviceId});
        setDevice(device);
      }
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

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadSession}
      breadcrumbs={breadcrumbs}
      icon={<SessionIcon />}
      title={session ? `${session.email} - ${session.deviceName}` : ""}
      headerContent={<SessionDetailsPanel session={session} />}
      sideContent={[
        <UserCard key='user' firebaseUid={session?.uid} className='!flex-none' />,
        <DeviceCard key='device' deviceId={session?.deviceId} className='flex-1 grow' />
      ]}
      itemsContent={[<SessionTokensCard key='tokens' session={session} device={device} />]}
    />
  );    
}