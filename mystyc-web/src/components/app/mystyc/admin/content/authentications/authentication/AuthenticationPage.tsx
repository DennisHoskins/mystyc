'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout';
import AuthenticationIcon from '@/components/app/mystyc/admin/ui/icons/AuthenticationIcon';
import AuthenticationDetailsPanel from './content/AuthenticationDetailsPanel';
import AuthenticationUserPanel from './content/AuthenticationUserPanel';
import DeviceInfoPanel from '@/components/app/mystyc/admin/content/devices/device/DeviceInfoPanel';

export default function AuthenticationPage({ authId }: { authId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [authentication, setAuthentication] = useState<AuthEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAuthentication = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.getAuthEvent(authId);
      setAuthentication(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'UsersPage');
      if (!wasSessionError) {
        logger.error('Failed to load authentication:', err);
        setError('Failed to load authentication. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [authId, setBusy, handleSessionError]);

  useEffect(() => {
    loadAuthentication();
  }, [loadAuthentication]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Authentication', href: '/admin/authentication' },
    { 
      label: authentication ? (authentication._id || `Notification ${authId}`) : ``
    },
  ], [authentication, authId]);

  if (loading) {
    return;
  }

  if (!authentication) {
    return (
      <AdminItemLayout
        error={'Authentication Not Found'}
        onRetry={loadAuthentication}
        breadcrumbs={breadcrumbs}
        icon={<AuthenticationIcon size={6}/>}
        title={'Unkown Authentication'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadAuthentication}
      breadcrumbs={breadcrumbs}
      icon={<AuthenticationIcon size={6} />}
      title={authentication ? authentication.type : 'Unknown Authentication'}
      headerContent={<AuthenticationDetailsPanel authentication={authentication} />}
      sectionsContent={[(authentication.deviceId && <DeviceInfoPanel key='device' deviceId={authentication.deviceId} />)]}
      sidebarContent={<AuthenticationUserPanel firebaseUid={authentication && authentication.firebaseUid} />}
    />
  );
}