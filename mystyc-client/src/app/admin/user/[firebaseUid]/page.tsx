// mystyc-client/src/app/admin/user/[firebaseUid]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { DeviceData } from '@/interfaces/deviceData.interface';
import { AuthEventData } from '@/interfaces/authEventData.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { logger } from '@/util/logger';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import AdminPanelDevice from '@/components/admin/panels/AdminPanelDevice';
import TableDevices from '@/components/admin/tables/TableDevices';
import TableAuthEvents from '@/components/admin/tables/TableAuthEvents';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

function UserDetailPage() {
  const params = useParams();
  const firebaseUid = params.firebaseUid as string;
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const router = useCustomRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [authEvents, setAuthEvents] = useState<AuthEventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [authEventsLoading, setAuthEventsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devicesError, setDevicesError] = useState<string | null>(null);
  const [authEventsError, setAuthEventsError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!idToken || !firebaseUid) return;

      logger.log('[UserDetailPage] Fetching user details for:', firebaseUid);
      setBusy(true);
      setLoading(true);
      setError(null);

      try {
        const userData = await apiClientAdmin.getUser(idToken, firebaseUid);
        setUser(userData);
        logger.log('[UserDetailPage] User details loaded successfully');
      } catch (err: any) {
        logger.error('[UserDetailPage] Failed to load user details:', err);
        handleError(err);
        setError(err.message || 'Failed to load user details');
      } finally {
        setLoading(false);
        setBusy(false);
      }
    }

    fetchUser();
  }, [idToken, firebaseUid, setBusy, handleError]);

  useEffect(() => {
    async function fetchUserDevices() {
      if (!idToken || !firebaseUid) return;

      logger.log('[UserDetailPage] Fetching devices for user:', firebaseUid);
      setDevicesLoading(true);
      setDevicesError(null);

      try {
        const userDevices = await apiClientAdmin.getUserDevices(idToken, firebaseUid);
        setDevices(userDevices);
        logger.log('[UserDetailPage] User devices loaded successfully');
      } catch (err: any) {
        logger.error('[UserDetailPage] Failed to load user devices:', err);
        handleError(err);
        setDevicesError(err.message || 'Failed to load devices');
      } finally {
        setDevicesLoading(false);
      }
    }

    fetchUserDevices();
  }, [idToken, firebaseUid, handleError]);

  useEffect(() => {
    async function fetchUserAuthEvents() {
      if (!idToken || !firebaseUid) return;

      logger.log('[UserDetailPage] Fetching auth events for user:', firebaseUid);
      setAuthEventsLoading(true);
      setAuthEventsError(null);

      try {
        const userAuthEvents = await apiClientAdmin.getUserAuthEvents(idToken, firebaseUid, 50, 0);
        setAuthEvents(userAuthEvents);
        logger.log('[UserDetailPage] User auth events loaded successfully');
      } catch (err: any) {
        logger.error('[UserDetailPage] Failed to load user auth events:', err);
        handleError(err);
        setAuthEventsError(err.message || 'Failed to load auth events');
      } finally {
        setAuthEventsLoading(false);
      }
    }

    fetchUserAuthEvents();
  }, [idToken, firebaseUid, handleError]);

  const handleDevicesRefresh = async () => {
    if (!idToken || !firebaseUid) return;
    setDevicesLoading(true);
    setDevicesError(null);
    try {
      const userDevices = await apiClientAdmin.getUserDevices(idToken, firebaseUid);
      setDevices(userDevices);
    } catch (err: any) {
      handleError(err);
      setDevicesError(err.message || 'Failed to load devices');
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleAuthEventsRefresh = async () => {
    if (!idToken || !firebaseUid) return;
    setAuthEventsLoading(true);
    setAuthEventsError(null);
    try {
      const userAuthEvents = await apiClientAdmin.getUserAuthEvents(idToken, firebaseUid, 50, 0);
      setAuthEvents(userAuthEvents);
    } catch (err: any) {
      handleError(err);
      setAuthEventsError(err.message || 'Failed to load auth events');
    } finally {
      setAuthEventsLoading(false);
    }
  };

  const handleViewCurrentDevice = () => {
    if (user?.currentDeviceId) {
      router.push(`/admin/device/${user.currentDeviceId}`);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <AdminBreadcrumbs entityName="Loading..." />
          <AdminHeader title="Loading..." subtitle="Loading user details" />
        </div>
      </PageContainer>
    );
  }

  if (error || !user) {
    return (
      <PageContainer>
        <div className="space-y-8">
          <AdminBreadcrumbs entityName="Not Found" />
          <AdminHeader title="User Not Found" subtitle="The requested user could not be found" />
          <div className="text-center text-red-600 mt-4">{error}</div>
        </div>
      </PageContainer>
    );
  }

  // Find current device from devices list
  const currentDevice = user.currentDeviceId 
    ? devices.find(d => d.deviceId === user.currentDeviceId)
    : null;

  return (
    <PageContainer>
      <div className="space-y-8">
        <AdminBreadcrumbs entityName={user.fullName || user.email} />
        
        <AdminHeader 
          title={user.fullName || user.email || 'User Details'} 
          subtitle={`User Profile • ${firebaseUid}`}
        />

        {/* User Information Card */}
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
              <Text variant="small" className="font-medium text-gray-500 mb-1">Current Device</Text>
              <Text className="font-mono text-sm break-all">{user.currentDeviceId || '—'}</Text>
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

        {/* Current Device Section */}
        {currentDevice && (
          <AdminPanelDevice device={currentDevice} onViewDevice={handleViewCurrentDevice} />
        )}

        {/* User Devices and Auth Events */}
        <div className="space-y-8">
          <div>
            <Heading level={3} className="mb-4">User Devices</Heading>
            <TableDevices
              devices={devices}
              loading={devicesLoading}
              error={devicesError}
              onRefresh={handleDevicesRefresh}
            />
          </div>
          
          <div>
            <Heading level={3} className="mb-4">Recent Auth Events</Heading>
            <TableAuthEvents
              events={authEvents}
              loading={authEventsLoading}
              error={authEventsError}
              onRefresh={handleAuthEventsRefresh}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default withAdminAuth(UserDetailPage);