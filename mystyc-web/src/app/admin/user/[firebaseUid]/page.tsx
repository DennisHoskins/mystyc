'use client';

import { useEffect, useState, useMemo } from 'react';

import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { User, UserProfile, Device, AuthEvent } from '@/interfaces';
import { useAdminDetailPage } from '@/hooks/admin/useAdminDetailPage';
import { useAuth } from '@/components/context/AuthContext';

import AdminDetailLayout from '@/components/admin/AdminDetailLayout';
import AdminPanelDevice from '@/components/admin/panels/AdminPanelDevice';
import TableDevices from '@/components/admin/tables/AdminTableDevices';
import TableAuthEvents from '@/components/admin/tables/AdminTableAuthEvents';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

function UserDetailPage() {
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
 
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
          fetcher: (firebaseUid: string) => 
            apiClientAdmin.getUserAuthEvents(firebaseUid, 50, 0),
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
  } = useAdminDetailPage<User>({
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

  useEffect(() => {
      if (!currentUser || !currentUser.userProfile) {
        return;
      }

      setUserProfile(currentUser.userProfile);
  }, [currentUser])

  return (
    <AdminDetailLayout
      breadcrumbs={[
        { label: 'Users', href: '/admin/users' },
        { label: userProfile ? (userProfile.fullName || userProfile.email) : 'User' }
      ]}
      title={userProfile ? (userProfile.fullName || userProfile.email || 'User Details') : 'User Details'}
      subtitle={userProfile ? `User Profile • ${userProfile.firebaseUid}` : 'User Profile'}
      loading={loading}
      error={error}
      loadingTitle="Loading..."
      loadingSubtitle="Loading user details"
      notFoundTitle="User Not Found"
      notFoundSubtitle="The requested user could not be found"
    >
      {/* User Information Card */}
      {user && userProfile && (
        <div className="bg-blue-50 rounded-lg border border-gray-200 p-6 shadow-sm">
          <Heading level={3} className="mb-6">User Information</Heading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Firebase UID</Text>
              <Text className="font-mono text-sm break-all">{currentUser?.firebaseUser.uid}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Email Address</Text>
              <Text className="break-words">{userProfile.email}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Full Name</Text>
              <Text>{userProfile.fullName || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Date of Birth</Text>
              <Text>
                {userProfile.dateOfBirth 
                  ? new Date(userProfile.dateOfBirth).toLocaleDateString() 
                  : '—'
                }
              </Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Zodiac Sign</Text>
              <Text>{userProfile.zodiacSign || '—'}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">User Roles</Text>
              <Text>
                {userProfile.roles && userProfile.roles.length > 0 
                  ? userProfile.roles.join(', ') 
                  : 'User'
                }
              </Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Account Created</Text>
              <Text>{new Date(userProfile.createdAt).toLocaleString()}</Text>
            </div>
            
            <div>
              <Text variant="small" className="font-medium text-gray-500 mb-1">Last Updated</Text>
              <Text>{new Date(userProfile.updatedAt).toLocaleString()}</Text>
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