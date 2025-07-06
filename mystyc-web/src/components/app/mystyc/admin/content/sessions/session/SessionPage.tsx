'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Session, Device } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import SessionIcon from '@/components/app/mystyc/admin/ui/icons/SessionIcon';
import SessionDetailsPanel from './content/SessionDetailsPanel';
import SessionTokensPanel from './content/SessionTokensPanel';
import UserInfoPanel from '@/components/app/mystyc/admin/content/users/user/UserInfoPanel';
import DeviceInfoPanel from '@/components/app/mystyc/admin/content/devices/device/DeviceInfoPanel';

export default function SessionPage({ sessionId }: { sessionId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [session, setSession] = useState<Session | null>(null);
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getSession(sessionId);
      setSession(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load session:', err);
        setError('Failed to load session. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [sessionId, setBusy, handleSessionError]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions', href: '/admin/sessions' },
    { 
      label: session ? `${sessionId}` : ``
    },
  ], [session, sessionId]);

  const handleDeviceLoad = useCallback((device: Device) => {
    setDevice(device);
  }, []);

  if (loading) {
    return null;
  }

  if (!session) {
    return (
      <AdminItemLayout
        error={'Session Not Found'}
        onRetry={loadSession}
        breadcrumbs={breadcrumbs}
        icon={<SessionIcon />}
        title={'Unkown Session'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadSession}
      breadcrumbs={breadcrumbs}
      icon={<SessionIcon />}
      title={`${session.email} - ${session.deviceName}`}
      headerContent={<SessionDetailsPanel session={session} />}
      sectionsContent={[
        <UserInfoPanel key='user' firebaseUid={session.uid} />,
        <DeviceInfoPanel key='device' deviceId={session.deviceId} onLoad={handleDeviceLoad} />
      ]}
      sidebarContent={<SessionTokensPanel session={session} device={device} />}
    />
  );    
}