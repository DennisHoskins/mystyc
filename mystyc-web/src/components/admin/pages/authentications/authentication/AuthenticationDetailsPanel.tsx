'use client'

import { useState, useEffect, useCallback } from 'react';

import { AuthEvent, Device } from 'mystyc-common/schemas/';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { formatTimestampForComponent } from '@/util/dateTime';
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
      </AdminDetailGrid>
      <AdminDetailGrid cols={3} className='mt-4'>
        <AdminDetailField
          label="TCP/IP Address"
          value={authentication?.ip}
        />
        <AdminDetailField
          label="Timestamp"
          value={authentication 
            ? authentication.clientTimestamp ? formatTimestampForComponent(new Date(authentication.clientTimestamp).getTime()) : '-'
            : ""
          }
        />
        <AdminDetailField
          label="Timezone"
          value={device?.timezone}
        />
        <AdminDetailField
          label="Language"
          value={device?.language}
        />
        <AdminDetailField
          label="Platform"
          value={device?.platform}
        />
        <AdminDetailField
          label="Version"
          value={device?.appVersion}
        />
      </AdminDetailGrid>
      <AdminDetailGrid cols={1} className='mt-4'>
        <AdminDetailField
          label="UserAgent"
          value={device?.userAgent}
          type='description'
        />
      </AdminDetailGrid>
    </>
  );
}
