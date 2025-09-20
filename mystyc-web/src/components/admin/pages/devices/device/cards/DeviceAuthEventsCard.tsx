'use client'

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas';
import { getDeviceAuthEvents } from '@/server/actions/admin/devices';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import AuthenticationsCard from '../../../authentications/AuthenticationsCard';

export default function DeviceAuthEventsCard({ deviceId, total }: { deviceId?: string | null, total?: number | null }) {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadDeviceAuthEvents = useCallback(async () => {
    try {
      if (!deviceId) {
        return;
      }

      setError(null);

      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 3;
      const response = await getDeviceAuthEvents({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

      setAuthEvents(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load auth events:', err);
      setError('Failed to load auth events. Please try again.');
    }
  }, [deviceId]);

  useEffect(() => {
      loadDeviceAuthEvents();
  }, [hasLoaded, loadDeviceAuthEvents]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load authEvents'
        error={error}
        onRetry={() => loadDeviceAuthEvents()}
      />
    )
  }

  if (!authEvents) {
    return null;
  }

  return (
    <AuthenticationsCard 
      authEvents={authEvents} 
      total={total} 
      href={`/admin/devices/${deviceId}/auth-events`} 
    />
  );
}