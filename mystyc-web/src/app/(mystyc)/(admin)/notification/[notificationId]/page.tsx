'use client';

import { useMemo } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification } from '@/interfaces/notification.interface';
import { Device } from '@/interfaces/device.interface';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { useAdminDetailPage } from '@/hooks/admin/useAdminDetailPage';

import AdminDetailLayout from '@/components/admin/AdminDetailLayout';
import AdminPanelNotification from '@/components/admin/panels/AdminPanelNotification';
import AdminPanelUser from '@/components/admin/panels/AdminPanelUser';
import AdminPanelDevice from '@/components/admin/panels/AdminPanelDevice';
import Heading from '@/components/ui/Heading';

function NotificationDetailPage() {

  const fetcher = useMemo(
    () => ({
      main: (notificationId: string) => apiClientAdmin.getNotification(notificationId),
      related: [
        {
          key: 'notificationUser',
          fetcher: async (notificationId: string) => {
            const notification = await apiClientAdmin.getNotification(notificationId);
            if (notification?.firebaseUid) {
              return await apiClientAdmin.getUser(notification.firebaseUid);
            }
            return null;
          },
          optional: true,
        },
        {
          key: 'notificationDevice',
          fetcher: async (notificationId: string) => {
            const notification = await apiClientAdmin.getNotification(notificationId);
            if (notification?.deviceId) {
              return await apiClientAdmin.getDevice(notification.deviceId);
            }
            return null;
          },
          optional: true,
        },
      ],
    }),
    []
  );

  const {
    entity: notification,
    relatedData,
    loading,
    error,
    router,
  } = useAdminDetailPage<Notification>({
    entityName: 'Notification',
    paramKey: 'notificationId',
    fetcher,
    breadcrumbBase: {
      label: 'Notifications',
      href: '/admin/notifications',
    },
  });

  const notificationUser = relatedData.notificationUser as UserProfile | null;
  const notificationDevice = relatedData.notificationDevice as Device | null;

  const handleViewUser = () => {
    if (notificationUser?.firebaseUid) {
      router.push(`/admin/user/${notificationUser.firebaseUid}`);
    }
  };

  const handleViewDevice = () => {
    if (notificationDevice?.deviceId) {
      router.push(`/admin/device/${notificationDevice.deviceId}`);
    }
  };

  return (
    <AdminDetailLayout
      breadcrumbs={[
        { label: 'Notifications', href: '/admin/notifications' },
        { label: notification ? `${notification.type} Notification` : 'Notification' }
      ]}
      title={notification ? `${notification.type} Notification` : 'Notification'}
      subtitle={notification ? `Notification Details • ${notification.title}` : 'Notification Details'}
      loading={loading}
      error={error}
      loadingTitle="Loading..."
      loadingSubtitle="Loading notification details"
      notFoundTitle="Notification Not Found"
      notFoundSubtitle="The requested notification could not be found"
    >
      {notification && <AdminPanelNotification notification={notification} />}

      {notificationUser && (
        <AdminPanelUser user={notificationUser} onViewUser={handleViewUser} />
      )}

      {notificationDevice && (
        <AdminPanelDevice device={notificationDevice} onViewDevice={handleViewDevice} />
      )}

      {/* Raw Notification Data */}
      {notification && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <Heading level={3} className="mb-4">Raw Notification Data</Heading>
          <div className="bg-gray-50 rounded p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-auto">
              {JSON.stringify(notification, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </AdminDetailLayout>
  );
}

export default NotificationDetailPage;