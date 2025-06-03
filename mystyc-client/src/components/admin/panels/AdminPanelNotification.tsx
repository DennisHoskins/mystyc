import React from 'react';

import AdminPanel from './AdminPanel';
import Text from '@/components/ui/Text';
import { Notification } from '@/interfaces/notification.interface';

interface AdminPanelNotificationProps {
  notification: Notification;
}

export default function AdminPanelNotification({ notification }: AdminPanelNotificationProps) {
  return (
    <AdminPanel title="Notification Details" variant="warning">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Text variant="small" className="font-medium text-yellow-600 mb-1">Title</Text>
          <Text className="text-yellow-800 font-medium">{notification.title}</Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-yellow-600 mb-1">Type</Text>
          <Text className="text-yellow-800 capitalize">{notification.type}</Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-yellow-600 mb-1">Status</Text>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            notification.status === 'sent' 
              ? 'bg-green-100 text-green-800' 
              : notification.status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {notification.status}
          </span>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-yellow-600 mb-1">Created</Text>
          <Text className="text-yellow-800">
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : '—'}
          </Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-yellow-600 mb-1">Firebase UID</Text>
          <Text className="text-yellow-800 font-mono text-sm break-all">{notification.firebaseUid}</Text>
        </div>
        
        {notification.deviceId && (
          <div>
            <Text variant="small" className="font-medium text-yellow-600 mb-1">Device ID</Text>
            <Text className="text-yellow-800 font-mono text-sm break-all">{notification.deviceId}</Text>
          </div>
        )}
        
        {notification.fcmToken && (
          <div className="md:col-span-2 lg:col-span-3">
            <Text variant="small" className="font-medium text-yellow-600 mb-1">FCM Token</Text>
            <Text className="text-yellow-800 font-mono text-xs break-all">
              {notification.fcmToken.substring(0, 20)}...
            </Text>
          </div>
        )}
        
        <div className="md:col-span-2 lg:col-span-3">
          <Text variant="small" className="font-medium text-yellow-600 mb-1">Message Body</Text>
          <Text className="text-yellow-800">{notification.body}</Text>
        </div>
        
        {notification.error && (
          <div className="md:col-span-2 lg:col-span-3">
            <Text variant="small" className="font-medium text-red-600 mb-1">Error Details</Text>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <Text className="text-red-800 text-sm">{notification.error}</Text>
            </div>
          </div>
        )}
        
        {notification.messageId && (
          <div>
            <Text variant="small" className="font-medium text-yellow-600 mb-1">Message ID</Text>
            <Text className="text-yellow-800 font-mono text-sm break-all">{notification.messageId}</Text>
          </div>
        )}
      </div>
    </AdminPanel>
  );
}
