'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { AuthEvent } from 'mystyc-common/schemas/auth-event.schema';
import { getAuthEvent } from '@/server/actions/admin/auth-events';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import { formatStringForDisplay } from '@/util/util';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AuthenticationDetailsPanel from './AuthenticationDetailsPanel';
import UserCard from '../../users/user/UserCard';

export default function AuthenticationPage({ authId }: { authId: string }) {
  const { setBusy } = useBusy();
  const [authentication, setAuthentication] = useState<AuthEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadAuthentication = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getAuthEvent({deviceInfo: getDeviceInfo(),  eventId: authId});
      setAuthentication(data);
    } catch (err) {
      logger.error('Failed to load authentication:', err);
      setError('Failed to load authentication. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [authId, setBusy]);

  useEffect(() => {
    loadAuthentication();
  }, [loadAuthentication]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Authentication', href: '/admin/authentication' },
    { label: authentication?.type ? formatStringForDisplay(authentication?.type.replace("-", " ")) : "" },
  ], [authentication]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadAuthentication}
      breadcrumbs={breadcrumbs}
      icon={<AuthenticationIcon size={6} />}
      title={authentication?.type ?? "Authentication"}
      headerContent={<AuthenticationDetailsPanel authentication={authentication} />}
      sideContent={[<UserCard key='user' firebaseUid={authentication?.firebaseUid} className='flex-1 grow' />]}
    />
  );
}