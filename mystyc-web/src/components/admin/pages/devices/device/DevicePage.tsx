'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { DeviceSession } from '@/interfaces';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import Card from '@/components/ui/Card';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import DeviceIcon from '@/components/admin/ui/icons/DeviceIcon';
import DeviceDetailsPanel from './DeviceDetailsPanel';
import DeviceUsersPanel from './DeviceUsersPanel';
import DeviceSessionPanel from './DeviceSessionPanel';
import DeviceTabCard from './DeviceTabCard';

export default function DevicePage({ deviceId }: { deviceId: string }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [deviceSession, setDeviceSession] = useState<DeviceSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const data = await apiClientAdmin.devices.getDeviceSession(deviceId);
      setDeviceSession(data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'DevicePage');
      if (!wasSessionError) {
        logger.error('Failed to load device:', err);
        setError('Failed to load device. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [deviceId, setBusy, handleSessionError]);

  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices', href: '/admin/devices' },
    { 
      label: deviceSession ? (deviceSession.device.deviceId || `Device ${deviceId}`) : ``
    },
  ], [deviceSession, deviceId]);

  if (loading) {
    return null;
  }

  if (!deviceSession) {
    return (
      <AdminItemLayout
        error={'Device Not Found'}
        onRetry={loadDevice}
        breadcrumbs={breadcrumbs}
        icon={<DeviceIcon size={6}/>}
        title={'Unkown Device'}
      />
    );
  }

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadDevice}
      breadcrumbs={breadcrumbs}
      icon={deviceSession && <DeviceIcon size={6} device={deviceSession.device}/>}
      title={deviceSession && deviceSession.device.deviceName ? deviceSession.device.deviceName : `Unknown Device`}
      headerContent={<DeviceDetailsPanel device={deviceSession && deviceSession.device} />}
      sectionsContent={[
        <Card key='users' className='h-[15rem]'>
          <DeviceUsersPanel deviceId={deviceSession.device.deviceId} />
        </Card>
      ]}
      sidebarContent={<DeviceSessionPanel deviceSession={deviceSession} />}
      mainContent={<DeviceTabCard deviceId={deviceSession.device.deviceId} />}
    />
  );
}