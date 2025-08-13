'use client'

import { useEffect, useCallback, useState } from 'react';

import { Device } from 'mystyc-common/schemas';
import { getUserDevices } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import Capsule from '@/components/ui/Capsule';

export default function UserDevicesCard({ firebaseUid, total }: { firebaseUid?: string | null, total: number | null }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserDevices = useCallback(async () => {
    try {
      if (!firebaseUid) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getUserDevices({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});

      setDevices(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    }
  }, [firebaseUid]);

  useEffect(() => {
      loadUserDevices();
  }, [hasLoaded, loadUserDevices]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load devices'
        error={error}
        onRetry={() => loadUserDevices()}
      />
    )
  }

  return (
    <Card className='flex flex-col space-y-2'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={DevicesIcon} />
        <Link href={`/admin/users/${firebaseUid}/devices`} className='flex w-full'>
          <Heading level={4} className='flex-1'>Devices</Heading>
        </Link>          
      </div>
      {total &&
        <>
          <hr/ >
          <div className='flex flex-col space-y-4'>
            {devices.map((device) => (
              <Link 
                key={device.deviceId} 
                href={`/admin/devices/${device.deviceId}`}
                className="flex !flex-row items-center space-x-4"
              >
                <div className='overflow-hidden !mt-0'>
                  <Heading level={5}>{device.deviceName ? device.deviceName.split(" (")[0] : "Unknown Device"}</Heading>
                  <Heading level={6} className='!text-[10px]'>{device.deviceId}</Heading>
                  {device.fcmToken && <Capsule label="Online" />}
                </div>
              </Link>
            ))}
            {total > 1 && <Capsule label={'Total ' + total} href={`/admin/users/${firebaseUid}/devices`} />}
          </div>        
        </>
      }
    </Card>
  );
}