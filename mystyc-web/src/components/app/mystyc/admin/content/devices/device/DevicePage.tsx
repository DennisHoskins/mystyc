'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminItemLayout from '@/components/app/mystyc/admin/ui/AdminItemLayout'
import DeviceDetailsPanel from './DeviceDetailsPanel';
import DeviceUsersPanel from './DeviceUsersPanel';
import DeviceInfoPanel from './DeviceInfoPanel';
import DeviceTabPanel from './DeviceTabPanel';

export default function DevicePage({ deviceId }: { deviceId: string }) {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getDevice(deviceId);
      setDevice(data);
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
      label: device ? (device.deviceId || `Device ${deviceId}`) : ``
    },
  ], [device, deviceId]);

  return (
   <AdminItemLayout
      breadcrumbs={breadcrumbs}
      title={device && device.deviceName ? device.deviceName : `Unknown Device`}
      headerContent={
        <DeviceDetailsPanel
          device={device}
          error={error}
          loading={loading}
          onRetry={loadDevice}
        />
      }
      mainContent={
        <DeviceUsersPanel deviceId={device && device.deviceId} />
      }
      sidebarContent={
        <DeviceInfoPanel device={device} />
      }
      tabsContent={
        <DeviceTabPanel deviceId={device && device.deviceId} />
      }
    />
  );
}