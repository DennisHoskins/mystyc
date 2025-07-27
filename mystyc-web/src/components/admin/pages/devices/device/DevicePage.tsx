'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { DeviceSession } from '@/interfaces';
import { getDeviceSession } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import DeviceIcon from '@/components/admin/ui/icons/DeviceIcon';
import DeviceDetailsPanel from './DeviceDetailsPanel';
import DeviceSessionPanel from './DeviceSessionPanel';
import DeviceTabCard from './DeviceTabCard';

export default function DevicePage({ deviceId }: { deviceId: string }) {
  const { setBusy } = useBusy();
  const [deviceSession, setDeviceSession] = useState<DeviceSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const data = await getDeviceSession({deviceInfo: getDeviceInfo(), deviceId});
      setDeviceSession(data);
    } catch (err) {
      logger.error('Failed to load device:', err);
      setError('Failed to load device. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [deviceId, setBusy]);

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

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadDevice}
      breadcrumbs={breadcrumbs}
      icon={deviceSession && <DeviceIcon size={6} device={deviceSession.device}/>}
      title={deviceSession && deviceSession.device.deviceName ? deviceSession.device.deviceName : `Unknown Device`}
      headerContent={<DeviceDetailsPanel device={deviceSession && deviceSession.device} />}
      sidebarContent={<DeviceSessionPanel deviceSession={deviceSession} />}
      mainContent={<DeviceTabCard deviceId={deviceSession?.device.deviceId} />}
    />
  );
}