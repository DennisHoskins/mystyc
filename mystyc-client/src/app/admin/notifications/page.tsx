'use client';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/admin/AdminListLayout';
import Button from '@/components/ui/Button';
import Text from '@/components/ui/Text';

function NotificationsPage() {
  const { idToken } = useAuth();
  const { token } = useFirebaseMessaging();
  const { showToast } = useToast();

  const handleSendNotification = async () => {
    if (!token || !idToken) {
      showToast('Notifications not available - please enable them first');
      return;
    }

    try {
      await apiClientAdmin.sendTestNotification(idToken, token);
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
      subtitle="Manage system notifications"
      action={
        <Button 
          onClick={handleSendNotification}
          disabled={!token || !idToken}
          variant="primary"
        >
          Send Test Notification
        </Button>
      }
    >
      {/* Placeholder for future notifications list */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <Text className="text-gray-500 mb-2">No notifications stored yet</Text>
          <Text variant="small" className="text-gray-400">
            Notification history will appear here once server storage is implemented
          </Text>
        </div>
      </div>
    </AdminListLayout>
  );
}

export default withAdminAuth(NotificationsPage);