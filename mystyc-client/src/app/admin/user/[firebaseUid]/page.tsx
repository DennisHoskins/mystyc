'use client';

import { useMemo } from 'react';

import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { Device } from '@/interfaces/device.interface';
import { AuthEvent } from '@/interfaces/authEvent.interface';
import { useAdminDetailPage } from '@/hooks/admin/useAdminDetailPage';

import AdminDetailLayout from '@/components/admin/AdminDetailLayout';
import AdminPanelDevice from '@/components/admin/panels/AdminPanelDevice';
import TableDevices from '@/components/admin/tables/AdminTableDevices';
import TableAuthEvents from '@/components/admin/tables/AdminTableAuthEvents';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

function UserDetailPage() {

  const fetcher = useMemo(
    () => ({
      main: apiClientAdmin.getUser,
      related: [
        {
          key: 'devices',
          fetcher: apiClientAdmin.getUserDevices,
          optional: true,
        },
        {
          key: 'authEvents',
          fetcher: (token: string, firebaseUid: string) => 
            apiClientAdmin.getUserAuthEvents(token, firebaseUid, 50, 0),
          optional: true,
        },
      ],
    }),
    []
  );
  
  const {
    entity: user,
    relatedData,
    loading,
    error,
    router,
    refetch
  } = useAdminDetailPage<UserProfile>({
    entityName: 'User',
    paramKey: 'firebaseUid',
    fetcher
  });

  const devices = relatedData.devices as Device[] || [];
  const authEvents = relatedData.authEvents as AuthEvent[] || [];

  // Filter for ready/online devices (devices with FCM tokens)
  const readyDevices = devices.filter(device => device.fcmToken);

  const handleViewDevice = (device: Device) => {
    router.push(`/admin/device/${device.deviceId}`);
  };

  const handleDevicesRefresh = async () => {
    await refetch();
  };

  const handleAuthEventsRefresh = async () => {
    await refetch();
  };

  return (
    <AdminDetailLayout
      breadcrumbs={[
        { label: 'Users', href: '/admin/users' },
        { label: user ? (user.fullName || user.email) : 'User' }
      ]}
      title={user ? (user.fullName || user.email || 'User Details') : 'User Details'}
      subtitle={user ? `User Profile • ${user.firebaseUid}` : 'User Profile'}
      loading={loading}
      error={error}
      loadingTitle="Loading..."
      loadingSubtitle="Loading user details"
      notFoundTitle="User Not Found"
      notFoundSubtitle="The requested user could not be found"
    >
      {/* User Information Card */}
      {user && (
        <div className="bg-blue-50 rounded-lg border border-gray-200 p-6 shadow-sm">
          <Heading level={3} className="mb-6">User Information</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Firebase UID</Text>
              <Text className="font-mono text-sm break-all">{user.firebaseUid}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Email Address</Text>
              <Text className="break-words">{user.email}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Full Name</Text>
              <Text>{user.fullName || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Date of Birth</Text>
              <Text>
                {user.dateOfBirth 
                  ? new Date(user.dateOfBirth).toLocaleDateString() 
                  : '—'
                }
              </Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Zodiac Sign</Text>
              <Text>{user.zodiacSign || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">User Roles</Text>
              <Text>
                {user.roles && user.roles.length > 0 
                  ? user.roles.join(', ') 
                  : 'User'
                }
              </Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Account Created</Text>
              <Text>{new Date(user.createdAt).toLocaleString()}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Last Updated</Text>
              <Text>{new Date(user.updatedAt).toLocaleString()}</Text>
            </div>
          </div>
        </div>
      )}

      {/* Ready/Online Devices */}
      {readyDevices.length > 0 && (
        <div className="space-y-4">
          <Heading level={3}>Ready Devices ({readyDevices.length})</Heading>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {readyDevices.map((device) => (
              <AdminPanelDevice
                key={device.deviceId}
                device={device}
                onViewDevice={() => handleViewDevice(device)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All User Devices and Auth Events */}
      <div className="space-y-8">
        <div>
          <Heading level={3} className="mb-4">All User Devices</Heading>
          <TableDevices
            devices={devices}
            loading={loading}
            error={null}
            onRefresh={handleDevicesRefresh}
            compact={true}
          />
        </div>
        
        <div>
          <Heading level={3} className="mb-4">Recent Auth Events</Heading>
          <TableAuthEvents
            events={authEvents}
            loading={loading}
            error={null}
            onRefresh={handleAuthEventsRefresh}
            compact={true}
          />
        </div>
      </div>
    </AdminDetailLayout>
  );
}

export default withAdminAuth(UserDetailPage);