'use client'

import { useState, useEffect, useCallback } from 'react';

import { Device } from 'mystyc-common/schemas/device.schema';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import DeviceIcon from '@/components/admin/ui/icons/DeviceIcon'

export default function DeviceCard({ deviceId, className }: { deviceId?: string | null, className?: string }) {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    if (!deviceId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await getDevice({deviceInfo: getDeviceInfo(), deviceId});
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

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div>{error}</div>
    )
  }

  if (!device) {
    return (
      <div>Device not found</div>
    )
  }

  return (
    <AdminCard
      icon={<DeviceIcon device={device} />} 
      title={device.deviceName}
      href={`/admin/devices/${deviceId}`}
      className={`flex flex-col space-y-1 ${className}`}
    >
      <Panel padding={4}>
        <AdminDetailGrid>
          <AdminDetailField
            label="Device Id"
            value={device.deviceId}
            href={`/admin/devices/${device.deviceId}`}
          />
          <AdminDetailField
            label="Timezone"
            value={device.timezone}
          />
          <AdminDetailField
            label="Language"
            value={device.language}
          />
          <AdminDetailField
            label="Platform"
            value={device.platform}
          />
        </AdminDetailGrid>
      </Panel>
    </AdminCard>
  );
}