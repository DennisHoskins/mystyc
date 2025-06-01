import React from 'react';

import AdminPanel from './AdminPanel';
import Text from '@/components/ui/Text';
import { AuthEventData } from '@/interfaces/authEventData.interface';

interface AdminPanelAuthEventProps {
  authEvent: AuthEventData;
}

export default function AdminPanelAuthEvent({ authEvent }: AdminPanelAuthEventProps) {
  return (
    <AdminPanel title="Event Details" variant="primary">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Text variant="small" className="font-medium text-blue-600 mb-1">Event Type</Text>
          <Text className="text-blue-800 font-medium capitalize">{authEvent.type}</Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-blue-600 mb-1">Timestamp</Text>
          <Text className="text-blue-800">{new Date(authEvent.clientTimestamp).toLocaleString()}</Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-blue-600 mb-1">IP Address</Text>
          <Text className="text-blue-800 font-mono">{authEvent.ip || '—'}</Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-blue-600 mb-1">Platform</Text>
          <Text className="text-blue-800">{authEvent.platform || '—'}</Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-blue-600 mb-1">Device ID</Text>
          <Text className="text-blue-800 font-mono text-sm break-all">{authEvent.deviceId}</Text>
        </div>
        
        <div>
          <Text variant="small" className="font-medium text-blue-600 mb-1">Firebase UID</Text>
          <Text className="text-blue-800 font-mono text-sm break-all">{authEvent.firebaseUid}</Text>
        </div>
      </div>
    </AdminPanel>
  );
}