'use client';

import React from 'react';

import AdminPanel from './AdminPanel';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/util/logger';

interface AdminPanelUserProps {
  user: UserProfile;
  onViewUser?: () => void;
}

export default function AdminPanelUser({ user, onViewUser }: AdminPanelUserProps) {
  const { showToast } = useToast();

  const handleSendNotification = async () => {
    try {
      await apiClientAdmin.sendUserNotification(user.firebaseUid);
      showToast(`Notification sent to all devices for ${user.fullName || user.email}`);
    } catch (error) {
      logger.error('Error sending notification to user devices', { 
        error: error instanceof Error ? error.message : String(error),
        userId: user.firebaseUid
      });
      showToast('Failed to send notification to user devices');
    }
  };

  return (
    <AdminPanel title="Associated User" variant="success">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-green-800 font-medium">{user.fullName || user.email}</Text>
          <Text variant="small" className="text-green-600">{user.email}</Text>
          <Text variant="small" className="text-green-600">Firebase UID: {user.firebaseUid}</Text>
        </div>
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={handleSendNotification}
            size="sm" 
            variant="primary"
          >
            Send Notification
          </Button>
          {onViewUser && (
            <Button onClick={onViewUser} size="sm" variant="secondary">
              View User Profile
            </Button>
          )}
        </div>
      </div>
    </AdminPanel>
  );
}