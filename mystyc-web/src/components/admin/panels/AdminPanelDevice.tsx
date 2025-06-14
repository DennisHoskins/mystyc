'use client';

import React from 'react';

import AdminPanel from './AdminPanel';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import { Device } from '@/interfaces/device.interface';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { useToast } from '@/hooks/useToast';
import { logger } from '@/util/logger';

interface AdminPanelDeviceProps {
  device: Device;
  onViewDevice?: () => void;
}

export default function AdminPanelDevice({ device, onViewDevice }: AdminPanelDeviceProps) {
  const { showToast } = useToast();

  const handleSendNotification = async () => {
    if (!device.deviceId) {
      showToast('Device ID not available');
      return;
    }

    try {
      await apiClientAdmin.sendDeviceNotification(device.deviceId);
      showToast(`Notification sent to device ${device.deviceId}`);
    } catch (error) {
      logger.error('Error sending notification to device', { 
        error: error instanceof Error ? error.message : String(error),
        deviceId: device.deviceId
      });
      showToast('Failed to send notification to device');
    }
  };

  return (
    <AdminPanel title="Associated Device" variant="info">
      <div className="flex items-center justify-between">
        <div>
          <Text className="text-purple-800 font-medium font-mono text-sm">{device.deviceId}</Text>
          <Text variant="small" className="text-purple-600">{device.platform || 'Unknown Platform'}</Text>
          <Text variant="small" className="text-purple-600">App Version: {device.appVersion || 'Unknown'}</Text>
        </div>
        <div className="flex flex-col space-y-2">
          <Button 
            onClick={handleSendNotification}
            size="sm" 
            variant="primary"
          >
            Send Notification
          </Button>
          {onViewDevice && (
            <Button onClick={onViewDevice} size="sm" variant="secondary">
              View Device Details
            </Button>
          )}
        </div>
      </div>
    </AdminPanel>
  );
}