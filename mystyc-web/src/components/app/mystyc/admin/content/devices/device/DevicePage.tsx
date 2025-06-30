'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { DeviceSession } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout'
import DeviceDetailsPanel from './DeviceDetailsPanel';
import DeviceUsersPanel from './DeviceUsersPanel';
import DeviceSessionPanel from './DeviceSessionPanel';
import DeviceTabPanel from './DeviceTabPanel';

export default function DevicePage({ deviceId }: { deviceId: string }) {
  const [deviceSession, setDeviceSession] = useState<DeviceSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getDevice(deviceId);
      setDeviceSession(data);
    } catch (err) {
      logger.error('Failed to load device:', err);
      setError('Failed to load device. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  // Generate breadcrumbs with device info
  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices', href: '/admin/devices' },
    { 
      label: deviceSession ? (deviceSession.device.deviceId || `Device ${deviceId}`) : ``
    },
  ], [deviceSession, deviceId]);

  return (
   <AdminItemLayout
      breadcrumbs={breadcrumbs}
      title={deviceSession && deviceSession.device.deviceName ? deviceSession.device.deviceName : `Unknown Device`}
      headerContent={
        <DeviceDetailsPanel
          device={deviceSession && deviceSession.device}
          error={error}
          loading={loading}
          onRetry={loadDevice}
        />
      }
      mainContent={
        <DeviceUsersPanel deviceId={deviceSession && deviceSession.device.deviceId} />
      }
      sidebarContent={
        <DeviceSessionPanel deviceSession={deviceSession} />
      }
      tabsContent={
        <DeviceTabPanel deviceId={deviceSession && deviceSession.device.deviceId} />
      }
    />
  );
}