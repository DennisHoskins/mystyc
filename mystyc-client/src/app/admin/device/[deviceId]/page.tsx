'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces/device.interface';
import { AuthEvent } from '@/interfaces/authEvent.interface';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { logger } from '@/util/logger';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminPanelUser from '@/components/admin/panels/AdminPanelUser';
import TableAuthEvents from '@/components/admin/tables/AdminTableAuthEvents';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

function DeviceDetailPage() {
  const params = useParams();
  const deviceId = params.deviceId as string;
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const router = useCustomRouter();

  const [device, setDevice] = useState<Device | null>(null);
  const [deviceOwner, setDeviceOwner] = useState<UserProfile | null>(null);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [authEventsLoading, setAuthEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authEventsError, setAuthEventsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDeviceData() {
      if (!idToken || !deviceId) return;

      logger.log('[DeviceDetailPage] Fetching device details for:', deviceId);
      setBusy(true);
      setLoading(true);
      setError(null);

      try {
        // Get all devices and find the one we want
        const device = await apiClientAdmin.getDevice(idToken, deviceId);
        
        if (!device) {
          throw new Error('Device not found');
        }
        
        setDevice(device);
        logger.log('[DeviceDetailPage] Device details loaded successfully');

        // If device has associated user data, fetch the user profile
        if (device.firebaseUid) {
          try {
            const userProfile = await apiClientAdmin.getUser(idToken, device.firebaseUid);
            setDeviceOwner(userProfile);
            logger.log('[DeviceDetailPage] Device owner loaded successfully');
          } catch (userErr) {
            logger.warn('[DeviceDetailPage] Failed to load device owner:', userErr);
            // Don't throw - device owner is optional info
          }
        }
      } catch (err: any) {
        logger.error('[DeviceDetailPage] Failed to load device details:', err);
        handleError(err);
        setError(err.message || 'Failed to load device details');
      } finally {
        setLoading(false);
        setBusy(false);
      }
    }

    fetchDeviceData();
  }, [idToken, deviceId, setBusy, handleError]);

  useEffect(() => {
    async function fetchDeviceAuthEvents() {
      if (!idToken || !deviceId) return;

      logger.log('[DeviceDetailPage] Fetching auth events for device:', deviceId);
      setAuthEventsLoading(true);
      setAuthEventsError(null);

      try {
        const deviceAuthEvents = await apiClientAdmin.getDeviceAuthEvents(idToken, deviceId, 50, 0);
        setAuthEvents(deviceAuthEvents);
        logger.log('[DeviceDetailPage] Device auth events loaded successfully');
      } catch (err: any) {
        logger.error('[DeviceDetailPage] Failed to load device auth events:', err);
        handleError(err);
        setAuthEventsError(err.message || 'Failed to load auth events');
      } finally {
        setAuthEventsLoading(false);
      }
    }

    fetchDeviceAuthEvents();
  }, [idToken, deviceId, handleError]);

  const handleAuthEventsRefresh = async () => {
    if (!idToken || !deviceId) return;
    setAuthEventsLoading(true);
    setAuthEventsError(null);
    try {
      const deviceAuthEvents = await apiClientAdmin.getDeviceAuthEvents(idToken, deviceId, 50, 0);
      setAuthEvents(deviceAuthEvents);
    } catch (err: any) {
      handleError(err);
      setAuthEventsError(err.message || 'Failed to load auth events');
    } finally {
      setAuthEventsLoading(false);
    }
  };

  const handleViewUser = () => {
    if (deviceOwner?.firebaseUid) {
      router.push(`/admin/user/${deviceOwner.firebaseUid}`);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <AdminBreadcrumbs items={[
            { label: 'Devices', href: '/admin/devices' },
            { label: 'Loading...' }
          ]} />
          <AdminHeader title="Loading..." subtitle="Loading device details" />
        </div>
      </PageContainer>
    );
  }

  if (error || !device) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <AdminBreadcrumbs items={[
            { label: 'Devices', href: '/admin/devices' },
            { label: 'Not Found' }
          ]} />
          <AdminHeader title="Device Not Found" subtitle="The requested device could not be found" />
          <div className="text-center text-red-600 mt-4">{error}</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <AdminBreadcrumbs items={[
          { label: 'Devices', href: '/admin/devices' },
          { label: device.deviceId }
        ]} />
        
        <AdminHeader 
          title={`Device ${device.deviceId}`} 
          subtitle={`Device Details • ${device.platform || 'Unknown Platform'}`}
        />

        {deviceOwner && (
          <AdminPanelUser user={deviceOwner} onViewUser={handleViewUser} />
        )}

        {/* Device Information Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <Heading level={3} className="mb-6">Device Information</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Device ID</Text>
              <Text className="font-mono text-sm break-all">{device.deviceId}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Platform</Text>
              <Text>{device.platform || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Timezone</Text>
              <Text>{device.timezone || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Language</Text>
              <Text>{device.language || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">App Version</Text>
              <Text>{device.appVersion || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">FCM Token</Text>
              <Text className="font-mono text-xs break-all">
                {device.fcmToken ? `${device.fcmToken.substring(0, 20)}...` : '—'}
              </Text>
            </div>
            
            <div className="md:col-span-2 lg:col-span-3">
              <Text variant="small" className="font-medium text-gray-500 mb-1">User Agent</Text>
              <Text className="text-sm break-all">{device.userAgent || '—'}</Text>
            </div>

            {device.userAgentParsed && (
              <div className="md:col-span-2 lg:col-span-3">
                <Text variant="small" className="font-medium text-gray-500 mb-1">Parsed User Agent</Text>
                <div className="bg-gray-50 rounded p-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(device.userAgentParsed, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Device Auth Events */}
        <div>
          <Heading level={3} className="mb-4">Device Auth Events</Heading>
          <TableAuthEvents
            events={authEvents}
            loading={authEventsLoading}
            error={authEventsError}
            onRefresh={handleAuthEventsRefresh}
          />
        </div>
      </div>
    </PageContainer>
  );
}

export default withAdminAuth(DeviceDetailPage);