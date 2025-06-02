'use client';

import { useState, useMemo } from 'react';

import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces/device.interface';
import { AuthEvent } from '@/interfaces/authEvent.interface';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { useAdminDetailPage } from '@/hooks/admin/useAdminDetailPage';
import { useAuth } from '@/components/context/AuthContext';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/util/logger';

import AdminDetailLayout from '@/components/admin/AdminDetailLayout';
import AdminPanelUser from '@/components/admin/panels/AdminPanelUser';
import TableAuthEvents from '@/components/admin/tables/AdminTableAuthEvents';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

function DeviceDetailPage() {
  const [authEventsLoading, setAuthEventsLoading] = useState(false);
  const [authEventsError, setAuthEventsError] = useState<string | null>(null);
  const { idToken } = useAuth();
  const { showToast } = useToast();

  const fetcher = useMemo(
    () => ({
      main: apiClientAdmin.getDevice,
      related: [
        {
          key: 'deviceOwner',
          fetcher: async (token: string, deviceId: string) => {
            const device = await apiClientAdmin.getDevice(token, deviceId);
            if (device?.firebaseUid) {
              return await apiClientAdmin.getUser(token, device.firebaseUid);
            }
            return null;
          },
          optional: true,
        },
        {
          key: 'authEvents',
          fetcher: (token: string, deviceId: string) => 
            apiClientAdmin.getDeviceAuthEvents(token, deviceId, 50, 0),
          optional: true,
        },
      ]
    }),
    []
  );

  const {
    entity: device,
    relatedData,
    loading,
    error,
    router,
    refetch
  } = useAdminDetailPage<Device>({
    entityName: 'Device',
    paramKey: 'deviceId',
    fetcher,
    breadcrumbBase: {
      label: 'Devices',
      href: '/admin/devices',
    },
  });

  const deviceOwner = relatedData.deviceOwner as UserProfile | null;
  const authEvents = relatedData.authEvents as AuthEvent[] || [];

  const handleAuthEventsRefresh = async () => {
    setAuthEventsLoading(true);
    setAuthEventsError(null);
    try {
      await refetch();
    } catch (err: any) {
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

  const handleSendNotification = async () => {
    if (!device?.deviceId) {
      showToast('Device ID not available');
      return;
    }

    if (!idToken) {
      showToast('Authentication required');
      return;
    }

    try {
      await apiClientAdmin.sendDeviceNotification(idToken, device.deviceId);
      showToast('Notification sent to device successfully');
    } catch (error) {
      logger.error('Error sending notification to device', { 
        error: error instanceof Error ? error.message : String(error),
        deviceId: device.deviceId
      });
      showToast('Failed to send notification to device');
    }
  };

  return (
    <AdminDetailLayout
      breadcrumbs={[
        { label: 'Devices', href: '/admin/devices' },
        { label: device?.deviceId || 'Device' }
      ]}
      title={device ? `Device ${device.deviceId}` : 'Device'}
      subtitle={device ? `Device Details • ${device.platform || 'Unknown Platform'}` : 'Device Details'}
      loading={loading}
      error={error}
      loadingTitle="Loading..."
      loadingSubtitle="Loading device details"
      notFoundTitle="Device Not Found"
      notFoundSubtitle="The requested device could not be found"
      action={
        device?.deviceId ? (
          <Button 
            onClick={handleSendNotification}
            variant="primary"
          >
            Send Notification
          </Button>
        ) : undefined
      }
    >
      {deviceOwner && (
        <AdminPanelUser user={deviceOwner} onViewUser={handleViewUser} />
      )}

      {/* Device Information Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <Heading level={3} className="mb-6">Device Information</Heading>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Text variant="small" className="font-medium text-gray-500 mb-1">Device ID</Text>
            <Text className="font-mono text-sm break-all">{device?.deviceId}</Text>
          </div>
          
          <div>
            <Text variant="small" className="font-medium text-gray-500 mb-1">Platform</Text>
            <Text>{device?.platform || '—'}</Text>
          </div>
          
          <div>
            <Text variant="small" className="font-medium text-gray-500 mb-1">Timezone</Text>
            <Text>{device?.timezone || '—'}</Text>
          </div>
          
          <div>
            <Text variant="small" className="font-medium text-gray-500 mb-1">Language</Text>
            <Text>{device?.language || '—'}</Text>
          </div>
          
          <div>
            <Text variant="small" className="font-medium text-gray-500 mb-1">App Version</Text>
            <Text>{device?.appVersion || '—'}</Text>
          </div>
          
          <div>
            <Text variant="small" className="font-medium text-gray-500 mb-1">FCM Token</Text>
            <Text className="font-mono text-xs break-all">
              {device?.fcmToken ? `${device.fcmToken.substring(0, 20)}...` : '—'}
            </Text>
          </div>
          
          <div className="md:col-span-2 lg:col-span-3">
            <Text variant="small" className="font-medium text-gray-500 mb-1">User Agent</Text>
            <Text className="text-sm break-all">{device?.userAgent || '—'}</Text>
          </div>

          {device?.userAgentParsed && (
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
    </AdminDetailLayout>
  );
}

export default withAdminAuth(DeviceDetailPage);