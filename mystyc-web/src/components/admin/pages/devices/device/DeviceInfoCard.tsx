'use client'

import { useState, useEffect, useCallback } from 'react';

import { Device } from 'mystyc-common/schemas/';
import { getDevice } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import DeviceIcon from '@/components/admin/ui/icons/DeviceIcon'

export default function DeviceInfoCard({ deviceId, onLoad }: { deviceId?: string | null, onLoad?: (device: Device) => void; }) {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDevice = useCallback(async () => {
    try {
      if (!deviceId) {
        return;
      }
      setLoading(true);
      setError(null);

      const data = await getDevice({deviceInfo: getDeviceInfo(), deviceId});
      setDevice(data);
      
      onLoad?.(data);
    } catch (err) {
      logger.error('Failed to load device:', err);
      setError('Failed to load device. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [deviceId, onLoad]);

  useEffect(() => {
    loadDevice();
  }, [loadDevice]);

  if (loading || !device) {
    return (
      <Card className='min-h-22'>
        <div className="flex items-center space-x-4">
          <Avatar size={'medium'} icon={(props) => <DeviceIcon {...props} />} />
          <div>
            <Heading level={5}>Loading Device...</Heading>
            <Heading level={6}>Device Id:</Heading>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className='min-h-22'>
        <div className="flex items-center space-x-4">
          <Avatar size={'medium'} icon={(props) => <DeviceIcon {...props} />} />
          <div>
            <Heading level={5} className='text-red-400'>{error}</Heading>
            <Heading level={6}>Unable to load Device</Heading>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className='min-h-22'>
      <div className="flex items-center space-x-4">
        <Avatar size={'medium'} icon={(props) => <DeviceIcon {...props} device={device} />} />
        <div className='overflow-hidden'>
          <Heading level={5}>{device.deviceName ? device.deviceName.split(" (")[0] : "Unknown Device"}</Heading>
          <Heading level={6}>Device Id: <Link href={`/admin/devices/${device.deviceId}`}>{device.deviceId}</Link></Heading>
        </div>
      </div>
    </Card>
  );    
}