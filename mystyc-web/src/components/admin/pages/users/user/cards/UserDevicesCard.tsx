'use client'

import { useEffect, useCallback, useState } from 'react';

import { Device } from 'mystyc-common/schemas';
import { getUserDevices } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import DevicesCard from '../../../devices/DevicesCard';

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
      listQuery.limit = 2;
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

  if (!devices) {
    return null;
  }

  return (
    <DevicesCard 
      devices={devices} 
      total={total} 
      href={`/admin/users/${firebaseUid}/devices`} 
    />
  );
}