'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent } from '@/interfaces';
import { logger } from '@/util/logger';
import { formatDateForDisplay } from '@/util/dateTime';
import AdminBreadcrumbs from '@/components/app/mystyc/admin/ui/AdminBreadcrumbs';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AuthorizationPage({ authId }: { authId: string }) {
  const [authEvent, setAuthEvent] = useState<AuthEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuthEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getAuthEvent(authId);
      setAuthEvent(data);
    } catch (err) {
      logger.error('Failed to load auth event:', err);
      setError('Failed to load auth event. Please try again.');
    } finally {
      setLoading(false);
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

  if (loading) {
    return null;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">⚠️</div>
        <Heading level={3} className="mb-2 text-red-600">
          Error Loading Event
        </Heading>
        <Text variant="muted" className="mb-6">
          {error}
        </Text>
        <Button onClick={loadAuthEvent} variant="primary">
          Try Again
        </Button>
      </div>
    );
  }

  if (!authEvent) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👤</div>
        <Heading level={3} className="mb-2">
          User Not Found
        </Heading>
        <Text variant="muted">
          The requested user could not be found.
        </Text>
      </div>
    );
  }

  return (
    <>
      <AdminBreadcrumbs breadcrumbs={breadcrumbs} />

      <Card className="h-60 order-1 lg:col-span-2 lg:order-none">
        <Heading level={2}>{authEvent ? authEvent.type + " @ " + formatDateForDisplay(authEvent.timestamp) : "Event"}</Heading>
      </Card>

    </>
  );
}