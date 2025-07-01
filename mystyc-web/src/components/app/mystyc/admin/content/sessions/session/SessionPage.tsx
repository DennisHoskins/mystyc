'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Session } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import SessionIcon from '@/components/app/mystyc/admin/ui/icons/SessionIcon';
import SessionDetailsPanel from './content/SessionDetailsPanel';
import SessionTokensPanel from './content/SessionTokensPanel';
import UserInfoPanel from '@/components/app/mystyc/admin/content/users/user/UserInfoPanel';
import DeviceInfoPanel from '@/components/app/mystyc/admin/content/devices/device/DeviceInfoPanel';

export default function SessionPage({ sessionId }: { sessionId: string }) {
  const { setBusy } = useBusy();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    try {
      setError(null);
      setBusy(true);
      setLoading(true);

      const data = await apiClientAdmin.getSession(sessionId);
      setSession(data);
    } catch (err) {
      logger.error('Failed to load session:', err);
      setError('Failed to load session. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [sessionId, setBusy]);

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
        <DeviceInfoPanel key='device' deviceId={session.deviceId} />
      ]}
      sidebarContent={<SessionTokensPanel session={session} />}
    />
  );    
}