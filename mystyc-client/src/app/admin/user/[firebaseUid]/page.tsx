// mystyc-client/src/app/admin/user/[firebaseUid]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/util/logger';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';

function UserDetailPage() {
  const params = useParams();
  const firebaseUid = params.firebaseUid as string;
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      if (!idToken || !firebaseUid) return;

      logger.log('[UserDetailPage] Fetching user details for:', firebaseUid);
      setBusy(true);
      setLoading(true);
      setError(null);

      try {
        // Get all users and filter for the one we want
        // TODO: Could add a specific getUserById API endpoint later
        const allUsers = await apiClientAdmin.getUsers(idToken);
        const foundUser = allUsers.find((u: UserProfile) => u.firebaseUid === firebaseUid);
        
        if (!foundUser) {
          throw new Error('User not found');
        }
        
        setUser(foundUser);
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

  if (loading) {
    return (
      <PageContainer>
        <AdminHeader title="Loading..." subtitle="Loading user details" />
      </PageContainer>
    );
  }

  if (error || !user) {
    return (
      <PageContainer>
        <AdminHeader title="User Not Found" subtitle="The requested user could not be found" />
        <div className="text-center text-red-600 mt-4">{error}</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <AdminHeader 
          title={user.fullName || user.email || 'User Details'} 
          subtitle={`User Profile • ${firebaseUid}`}
        />

        {/* User Information Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
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

        {/* Placeholder for devices and auth events */}
        <div className="space-y-8">
          <div>
            <Heading level={3} className="mb-4">User Devices</Heading>
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              Device table will go here
            </div>
          </div>
          
          <div>
            <Heading level={3} className="mb-4">Recent Auth Events</Heading>
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              Auth events table will go here
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default withAdminAuth(UserDetailPage);