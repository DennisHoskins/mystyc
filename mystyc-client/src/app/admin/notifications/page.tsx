'use client';

import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Notification } from '@/interfaces/notification.interface';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import { useAdminListPage } from '@/hooks/admin/useAdminListPage';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/admin/AdminListLayout';
import TableNotifications from '@/components/admin/tables/AdminTableNotifications';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';

function NotificationsPage() {
  const { token } = useFirebaseMessaging();
  const { showToast } = useToast();
  const { data: notifications, loading, error, refresh } = useAdminListPage<Notification>({
    entityName: 'notifications',
    fetcher: apiClientAdmin.getNotifications,
  });

  const handleSendNotification = async () => {
    if (!token) {
      showToast('Notifications not available - please enable them first');
      return;
    }

    try {
      await apiClientAdmin.sendTestNotification();
      showToast('Test notification sent successfully');
    } catch (error) {
      logger.error('Error sending notification', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      showToast('Failed to send test notification');
    }
  };

  return (
    <AdminListLayout
      breadcrumbLabel="Notifications"
      title="Notifications"
      subtitle="View and manage system notifications"
      action={
        <Button 
          onClick={handleSendNotification}
          disabled={!token}
          variant="primary"
        >
          Send Test Notification
        </Button>
      }
    >
      {notifications.length > 0 ? (
        <TableNotifications
          notifications={notifications}
          loading={loading}
          error={error}
          onRefresh={refresh}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="text-center">
            <Text className="text-gray-500 mb-2">No notifications found</Text>
            <Text variant="small" className="text-gray-400">
              Sent notifications will appear here
            </Text>
          </div>
        </div>
      )}
    </AdminListLayout>
  );
}

export default withAdminAuth(NotificationsPage);