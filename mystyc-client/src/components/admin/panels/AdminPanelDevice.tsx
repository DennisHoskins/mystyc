import React from 'react';

import AdminPanel from './AdminPanel';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { Device } from '@/interfaces/device.interface';

interface AdminPanelDeviceProps {
  device: Device;
  onViewDevice?: () => void;
}

export default function AdminPanelDevice({ device, onViewDevice }: AdminPanelDeviceProps) {
  return (
    <AdminPanel title="Associated Device" variant="info">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-purple-800 font-medium font-mono text-sm">{device.deviceId}</Text>
          <Text variant="small" className="text-purple-600">{device.platform || 'Unknown Platform'}</Text>
          <Text variant="small" className="text-purple-600">App Version: {device.appVersion || 'Unknown'}</Text>
        </div>
        {onViewDevice && (
          <Button onClick={onViewDevice} size="sm" variant="secondary">
            View Device Details
          </Button>
        )}
      </div>
    </AdminPanel>
  );
}