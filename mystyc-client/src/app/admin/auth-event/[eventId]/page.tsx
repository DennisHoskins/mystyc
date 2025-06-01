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
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

function AuthEventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const router = useCustomRouter();

  const [authEvent, setAuthEvent] = useState<AuthEventData | null>(null);
  const [eventUser, setEventUser] = useState<UserProfile | null>(null);
  const [eventDevice, setEventDevice] = useState<DeviceData | null>(null);
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
    if (eventDevice?.deviceId) {
      router.push(`/admin/device/${eventDevice.deviceId}`);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <AdminHeader title="Loading..." subtitle="Loading auth event details" />
      </PageContainer>
    );
  }

  if (error || !authEvent) {
    return (
      <PageContainer>
        <AdminHeader title="Auth Event Not Found" subtitle="The requested auth event could not be found" />
        <div className="text-center text-red-600 mt-4">{error}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <AdminHeader 
          title={`${authEvent.type} Event`} 
          subtitle={`Auth Event Details • ${new Date(authEvent.clientTimestamp).toLocaleString()}`}
        />

        {/* Auth Event Details - Blue Bubble */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <Heading level={3} className="text-blue-900 mb-4">Event Details</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Text variant="small" className="font-medium text-blue-600 mb-1">Event Type</Text>
              <Text className="text-blue-800 font-medium capitalize">{authEvent.type}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-blue-600 mb-1">Timestamp</Text>
              <Text className="text-blue-800">{new Date(authEvent.clientTimestamp).toLocaleString()}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-blue-600 mb-1">IP Address</Text>
              <Text className="text-blue-800 font-mono">{authEvent.ip || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-blue-600 mb-1">Platform</Text>
              <Text className="text-blue-800">{authEvent.platform || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-blue-600 mb-1">Device ID</Text>
              <Text className="text-blue-800 font-mono text-sm break-all">{authEvent.deviceId}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-blue-600 mb-1">Firebase UID</Text>
              <Text className="text-blue-800 font-mono text-sm break-all">{authEvent.firebaseUid}</Text>
            </div>
          </div>
        </div>

        {/* Associated User Section */}
        {eventUser && (
          <div className="bg-green-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Heading level={4} className="text-green-900 mb-2">Associated User</Heading>
                <Text className="text-green-800 font-medium">{eventUser.fullName || eventUser.email}</Text>
                <Text variant="small" className="text-green-600">{eventUser.email}</Text>
                <Text variant="small" className="text-green-600">Firebase UID: {eventUser.firebaseUid}</Text>
              </div>
              <Button onClick={handleViewUser} size="sm" variant="secondary">
                View User Profile
              </Button>
            </div>
          </div>
        )}

        {/* Associated Device Section */}
        {eventDevice && (
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <Heading level={4} className="text-purple-900 mb-2">Associated Device</Heading>
                <Text className="text-purple-800 font-medium font-mono text-sm">{eventDevice.deviceId}</Text>
                <Text variant="small" className="text-purple-600">{eventDevice.platform || 'Unknown Platform'}</Text>
                <Text variant="small" className="text-purple-600">App Version: {eventDevice.appVersion || 'Unknown'}</Text>
              </div>
              <Button onClick={handleViewDevice} size="sm" variant="secondary">
                View Device Details
              </Button>
            </div>
          </div>
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