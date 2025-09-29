'use client'

import { useState, useEffect, useCallback } from 'react';

import { AuthEvent, Device } from 'mystyc-common/schemas/';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Panel from '@/components/ui/Panel';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import AdminErrorPage from '@/components/admin/ui/AdminError';

export default function AuthenticationDetailsPanel({ authentication }: { authentication: AuthEvent | null }) {
  const [device, setDevice] = useState<Device | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async (authentication: AuthEvent | null) => {
    try {
      if (!authentication) {
        return;
      }
      setError(null);

      const data = await getDevice({deviceInfo: getDeviceInfo(), deviceId: authentication.deviceId});
      setDevice(data);
    } catch (err) {
      logger.error('Failed to load device:', err);
      setError('Failed to load device. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadDevice(authentication);
  }, [loadDevice, authentication]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load device'
        error={error}
        onRetry={() => loadDevice(authentication)}
      />
    );
  }

  return (
    <>
      <AdminDetailGrid cols={3}>
        <Panel padding={4}>
          <AdminDetailField
            label="Device Name"
            value={device?.deviceName}
            href={'/admin/devices/' + device?.deviceId}
          />
          <AdminDetailField
            label="Device ID"
            value={device?.deviceId}
            href={'/admin/devices/' + device?.deviceId}
          />
          <AdminDetailField
            label="TCP/IP Address"
            value={authentication?.ip}
          />
        </Panel>
        <Panel padding={4}>
          <AdminDetailField
            label="Timezone"
            value={device?.timezone}
          />
          <AdminDetailField
            label="Language"
            value={device?.language}
          />
        </Panel>
        <Panel padding={4}>
          <AdminDetailField
            label="Platform"
            value={device?.platform}
          />
          <AdminDetailField
            label="Version"
            value={device?.appVersion}
          />
        </Panel>
      </AdminDetailGrid>
      <AdminDetailGrid className='mt-4'>
        <Panel padding={4}>
          <AdminDetailField
            label="UserAgent"
            value={device?.userAgent}
            type='description'
          />
        </Panel>
      </AdminDetailGrid>
    </>
  );
}
