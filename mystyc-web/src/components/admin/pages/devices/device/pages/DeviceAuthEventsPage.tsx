'use client'

import { useMemo, useState, useEffect, useCallback } from 'react';

import { AuthEvent, Device } from 'mystyc-common';
import { AdminListResponse } from 'mystyc-common/admin';
import { getDeviceAuthEvents } from '@/server/actions/admin/devices';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AuthenticationIcon from '@/components/admin/ui/icons/AuthenticationIcon';
import AuthEventTable from '../../../authentications/AuthenticationsTable';

export default function DeviceAuthEventPage({ deviceId } : { deviceId: string}) {
  const { setBusy } = useBusy();
  const [device, setDevice] = useState<Device | null>(null);
  const [data, setData] = useState<AdminListResponse<AuthEvent> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices', href: '/admin/devices' },
    { label: device ? `${device.deviceName ? device.deviceName : device.deviceId}` : ``, href: '/admin/devices/' + deviceId},
    { label: "Auth Events"},
  ], [device, deviceId]);

  const loadData = useCallback(async (deviceId: string) => {
    try {
      setError(null);
      setBusy(1000);

      const device = await getDevice({deviceInfo: getDeviceInfo(), deviceId})
      setDevice(device);

      const response = await getDeviceAuthEvents({deviceInfo: getDeviceInfo(), deviceId});

      setData(response);
    } catch (err) {
      logger.error('Failed to load device auth events:', err);
      setError('Failed to load device auth events. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!deviceId) {
      return;
    }
    loadData(deviceId);
  }, [loadData, deviceId]);

  return (
   <AdminListLayout
      title="AuthEvents"
      error={error}
      onRetry={() => {
        loadData(deviceId);
      }}
      breadcrumbs={breadcrumbs}
      icon={<AuthenticationIcon size={3} />}
      headerContent={
        <div className='flex flex-col grow'>
          <AuthEventTable
            authEvents={data}
            onRefresh={() => loadData(deviceId)}
          />
        </div>
      }
    />   
  );
}
