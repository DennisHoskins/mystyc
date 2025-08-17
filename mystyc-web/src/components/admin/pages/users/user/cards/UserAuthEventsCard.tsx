'use client'

import { useEffect, useCallback, useState } from 'react';

import { AuthEvent } from 'mystyc-common/schemas';
import { getUserAuthEvents } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import AuthenticationsCard from '../../../authentications/AuthenticationsCard';

export default function UserAuthEventCard({ firebaseUid, total }: { firebaseUid?: string | null, total: number | null }) {
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadUserAuthEvents = useCallback(async () => {
    try {
      if (!firebaseUid) {
        return;
      }
      setError(null);
      const listQuery = getDefaultListQuery(0);
      listQuery.limit = 2;
      listQuery.sortBy = 'createdAt';
      listQuery.sortOrder = 'desc'
      const response = await getUserAuthEvents({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});
      setAuthEvents(response.data);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load auth events:', err);
      setError('Failed to load auth events. Please try again.');
    }
  }, [firebaseUid]);

  useEffect(() => {
      loadUserAuthEvents();
  }, [hasLoaded, loadUserAuthEvents]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load auth events'
        error={error}
        onRetry={() => loadUserAuthEvents()}
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
      href={`/admin/users/${firebaseUid}/auth-events`} 
    />
  );
}