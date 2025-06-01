import React from 'react';

import AdminPanel from './AdminPanel';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { UserProfile } from '@/interfaces/userProfile.interface';

interface AdminPanelUserProps {
  user: UserProfile;
  onViewUser?: () => void;
}

export default function AdminPanelUser({ user, onViewUser }: AdminPanelUserProps) {
  return (
    <AdminPanel title="Associated User" variant="success">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-green-800 font-medium">{user.fullName || user.email}</Text>
          <Text variant="small" className="text-green-600">{user.email}</Text>
          <Text variant="small" className="text-green-600">Firebase UID: {user.firebaseUid}</Text>
        </div>
        {onViewUser && (
          <Button onClick={onViewUser} size="sm" variant="secondary">
            View User Profile
          </Button>
        )}
      </div>
    </AdminPanel>
  );
}