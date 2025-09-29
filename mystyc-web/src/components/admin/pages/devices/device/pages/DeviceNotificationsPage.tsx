'use client'

import { useMemo, useState, useEffect, useCallback } from 'react';

import { Notification, Device } from 'mystyc-common';
import { AdminListResponse } from 'mystyc-common/admin';
import { getDeviceNotifications } from '@/server/actions/admin/devices';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import NotificationTable from '../../../notifications/NotificationsTable';

export default function DeviceNotificationPage({ deviceId } : { deviceId: string}) {
  const { setBusy } = useBusy();
  const [device, setDevice] = useState<Device | null>(null);
  const [data, setData] = useState<AdminListResponse<Notification> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices', href: '/admin/devices' },
    { label: device ? `${device.deviceName ? device.deviceName : device.deviceId}` : ``, href: '/admin/devices/' + deviceId},
    { label: "Notifications"},
  ], [device, deviceId]);

  const loadData = useCallback(async (deviceId: string) => {
    try {
      setError(null);
      setBusy(1000);

      const device = await getDevice({deviceInfo: getDeviceInfo(), deviceId})
      setDevice(device);

      const response = await getDeviceNotifications({deviceInfo: getDeviceInfo(), deviceId});

      setData(response);
    } catch (err) {
      logger.error('Failed to load device notifications:', err);
      setError('Failed to load device notifications. Please try again.');
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
      title="Notifications"
      error={error}
      onRetry={() => {
        loadData(deviceId);
      }}
      breadcrumbs={breadcrumbs}
      icon={<NotificationIcon size={3} />}
      headerContent={
        <div className='flex flex-col grow'>
          <NotificationTable
            notifications={data}
            onRefresh={() => loadData(deviceId)}
          />
        </div>
      }
    />   
  );
}
