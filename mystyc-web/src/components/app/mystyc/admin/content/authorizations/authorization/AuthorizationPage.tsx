'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent } from '@/interfaces';
import { logger } from '@/util/logger';
import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';
import Text from '@/components/ui/Text';

export default function AuthorizationPage({ authId }: { authId: string }) {
  const [authEvent, setAuthEvent] = useState<AuthEvent | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const loadAuthEvent = useCallback(async () => {
    try {
      // setLoading(true);
      // setError(null);

      const data = await apiClientAdmin.getAuthEvent(authId);
      setAuthEvent(data);
    } catch (err) {
      logger.error('Failed to load auth event:', err);
      // setError('Failed to load auth event. Please try again.');
    } finally {
      // setLoading(false);
    }
  }, [authId]);

  useEffect(() => {
    loadAuthEvent();
  }, [loadAuthEvent]);

  // Generate breadcrumbs with auth event info
  const breadcrumbs = useMemo(() => [
    { label: 'Admin', href: '/admin' },
    { label: 'Authorization', href: '/admin/authorization' },
    { 
      label: authEvent ? (authEvent._id || `Device ${authId}`) : ``
    },
  ], [authEvent, authId]);

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        title={authEvent && authEvent._id ? authEvent._id : "Unknown Auth Event"}
      >
        <div className="space-y-1 mt-2">
          <Text variant="muted">
            <strong>FirebaseUid:</strong> {authEvent && authEvent.firebaseUid}
          </Text>
        </div>
      </AdminHeader>
    </>
  );
}