'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { Device } from 'mystyc-common/schemas/';
import { Session } from '@/interfaces';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import SessionIcon from '@/components/admin/ui/icons/SessionIcon';
import SessionDetailsPanel from './SessionDetailsPanel';
import SessionTokensPanel from './SessionTokensPanel';
import UserInfoCard from '@/components/admin/pages/users/user/UserInfoCard';
import DeviceInfoCard from '@/components/admin/pages/devices/device/DeviceInfoCard';

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

      const data = await apiClientAdmin.sessions.getSession(sessionId);
      setSession(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SessionPage');
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
        <UserInfoCard key='user' firebaseUid={session.uid} />,
        <DeviceInfoCard key='device' deviceId={session.deviceId} onLoad={handleDeviceLoad} />
      ]}
      sidebarContent={<SessionTokensPanel session={session} device={device} />}
    />
  );    
}