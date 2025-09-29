'use client'

import { useMemo, useState, useEffect, useCallback } from 'react';

import { Device, UserProfile } from 'mystyc-common';
import { AdminListResponse } from 'mystyc-common/admin';
import { getDeviceUsers } from '@/server/actions/admin/devices';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import UsersTable from '../../../users/UsersTable';

export default function DeviceUsersPage({ deviceId } : { deviceId: string}) {
  const { setBusy } = useBusy();
  const [device, setDevice] = useState<Device | null>(null);
  const [data, setData] = useState<AdminListResponse<UserProfile> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/devices' },
    { label: device ? `${device.deviceName ? device.deviceName : device.deviceId}` : ``, href: '/admin/devices/' + deviceId},
    { label: "Devices"},
  ], [device, deviceId]);

  const loadData = useCallback(async (deviceId: string) => {
    try {
      setError(null);
      setBusy(1000);

      const device = await getDevice({deviceInfo: getDeviceInfo(), deviceId})
      setDevice(device);

      const response = await getDeviceUsers({deviceInfo: getDeviceInfo(), deviceId});

      setData(response);
    } catch (err) {
      logger.error('Failed to load device devices:', err);
      setError('Failed to load device devices. Please try again.');
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
      title="Devices"
      error={error}
      onRetry={() => {
        loadData(deviceId);
      }}
      breadcrumbs={breadcrumbs}
      icon={<DevicesIcon size={3} />}
      headerContent={
        <div className='flex flex-col grow'>
          <UsersTable
            users={data}
            onRefresh={() => loadData(deviceId)}
          />
        </div>
      }
    />   
  );
}
