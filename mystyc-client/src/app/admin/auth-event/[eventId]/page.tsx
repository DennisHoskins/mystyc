// mystyc-client/src/app/admin/auth-event/[eventId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEventData } from '@/interfaces/authEventData.interface';
import { DeviceData } from '@/interfaces/deviceData.interface';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { logger } from '@/util/logger';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminPanelAuthEvent from '@/components/admin/panels/AdminPanelAuthEvent';
import AdminPanelUser from '@/components/admin/panels/AdminPanelUser';
import AdminPanelDevice from '@/components/admin/panels/AdminPanelDevice';
import Heading from '@/components/ui/Heading';

function AuthEventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const router = useCustomRouter();

  const [authEvent, setAuthEvent] = useState<AuthEventData | null>(null);
  const [eventUser, setEventUser] = useState<UserProfile | null>(null);
  const [eventDevice, setEventDevice] = useState<{ authEvent: AuthEventData, device: DeviceData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAuthEventData() {
      if (!idToken || !eventId) return;

      logger.log('[AuthEventDetailPage] Fetching auth event details for:', eventId);
      setBusy(true);
      setLoading(true);
      setError(null);

      try {
        // Get all auth events and find the one we want
        const allAuthEvents = await apiClientAdmin.getAuthEvents(idToken);
        const foundEvent = allAuthEvents.find((e: AuthEventData) => e._id === eventId);
        
        if (!foundEvent) {
          throw new Error('Auth event not found');
        }
        
        setAuthEvent(foundEvent);
        logger.log('[AuthEventDetailPage] Auth event details loaded successfully');

        // Fetch the associated user if firebaseUid exists
        if (foundEvent.firebaseUid) {
          try {
            const userProfile = await apiClientAdmin.getUser(idToken, foundEvent.firebaseUid);
            setEventUser(userProfile);
            logger.log('[AuthEventDetailPage] Event user loaded successfully');
          } catch (userErr) {
            logger.warn('[AuthEventDetailPage] Failed to load event user:', userErr);
            // Don't throw - user info is supplementary
          }
        }

        // Fetch the associated device using the getAuthEventDevice API
        try {
          const deviceData = await apiClientAdmin.getAuthEventDevice(idToken, eventId);
          setEventDevice(deviceData);
          logger.log('[AuthEventDetailPage] Event device loaded successfully');
        } catch (deviceErr) {
          logger.warn('[AuthEventDetailPage] Failed to load event device:', deviceErr);
          // Don't throw - device info is supplementary
        }

      } catch (err: any) {
        logger.error('[AuthEventDetailPage] Failed to load auth event details:', err);
        handleError(err);
        setError(err.message || 'Failed to load auth event details');
      } finally {
        setLoading(false);
        setBusy(false);
      }
    }

    fetchAuthEventData();
  }, [idToken, eventId, setBusy, handleError]);

  const handleViewUser = () => {
    if (eventUser?.firebaseUid) {
      router.push(`/admin/user/${eventUser.firebaseUid}`);
    }
  };

  const handleViewDevice = () => {
    if (eventDevice?.device?.deviceId) {
      router.push(`/admin/device/${eventDevice.device.deviceId}`);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <AdminBreadcrumbs entityName="Loading..." />
          <AdminHeader title="Loading..." subtitle="Loading auth event details" />
        </div>
      </PageContainer>
    );
  }

  if (error || !authEvent) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <AdminBreadcrumbs entityName="Not Found" />
          <AdminHeader title="Auth Event Not Found" subtitle="The requested auth event could not be found" />
          <div className="text-center text-red-600 mt-4">{error}</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <AdminBreadcrumbs entityName={`${authEvent.type} Event`} />
        
        <AdminHeader 
          title={`${authEvent.type} Event`} 
          subtitle={`Auth Event Details • ${new Date(authEvent.clientTimestamp).toLocaleString()}`}
        />

        <AdminPanelAuthEvent authEvent={authEvent} />

        {eventUser && (
          <AdminPanelUser user={eventUser} onViewUser={handleViewUser} />
        )}

        {eventDevice && (
          <AdminPanelDevice device={eventDevice.device} onViewDevice={handleViewDevice} />
        )}

        {/* Raw Event Data */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <Heading level={3} className="mb-4">Raw Event Data</Heading>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(authEvent, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default withAdminAuth(AuthEventDetailPage);