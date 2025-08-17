'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';

import { DeviceSummary } from 'mystyc-common/admin';
import { DeviceSession } from '@/interfaces';
import { getDeviceSession, getDeviceSummary } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import DeviceIcon from '@/components/admin/ui/icons/DeviceIcon';
import DeviceDetailsPanel from './DeviceDetailsPanel';
import DeviceUsersCard from './cards/DeviceUsersCard';
import DeviceNotificationsCard from './cards/DeviceNotificationsCard';
import DeviceAuthEventsCard from './cards/DeviceAuthEventsCard';
import DeviceSessionCard from './cards/DeviceSessionCard';

export default function DevicePage({ deviceId }: { deviceId: string }) {
  const { setBusy } = useBusy();
  const [summary, setSummary] = useState<DeviceSummary | null>(null);
  const [deviceSession, setDeviceSession] = useState<DeviceSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const summaryData = await getDeviceSummary({deviceInfo: getDeviceInfo(), deviceId});
      setSummary(summaryData);

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
    { label: deviceSession ? (deviceSession.device.deviceName || `${deviceId}`) : `` },
  ], [deviceSession, deviceId]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadDevice}
      breadcrumbs={breadcrumbs}
      icon={deviceSession && <DeviceIcon size={6} device={deviceSession.device}/>}
      title={deviceSession && deviceSession.device.deviceName ? deviceSession.device.deviceName : `Unknown Device`}
      headerContent={<DeviceDetailsPanel device={deviceSession && deviceSession.device} />}
      sideContent={[
        <DeviceUsersCard key='users' deviceId={deviceId} total={summary?.users} />,
        <DeviceNotificationsCard key='notifications' deviceId={deviceId} total={summary?.notifications} />,
        <DeviceAuthEventsCard key='auth-events' deviceId={deviceId} total={summary?.authEvents} />
      ]}
      itemsContent={[<DeviceSessionCard key='session' deviceSession={deviceSession} />]}
    />
  );
}