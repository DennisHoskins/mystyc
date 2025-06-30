'use client';

import { Device } from '@/interfaces';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';

interface DeviceDetailsPanelProps {
  device: Device | null;
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function DeviceDetailsPanel({ 
  device, 
  loading, 
  error,
  onRetry 
}: DeviceDetailsPanelProps) {

  if (loading) {
    return null;
  }

  if (error) {
    return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚠️</div>
          <Heading level={3} className="mb-2 text-red-600">
            Error Loading Device
          </Heading>
          <Text variant="muted" className="mb-6">
            {error}
          </Text>
          {onRetry && (
            <Button onClick={onRetry} variant="primary">
              Try Again
            </Button>
          )}
        </div>
    );
  }

  if (!device) {
    return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">👤</div>
          <Heading level={3} className="mb-2">
            Device Not Found
          </Heading>
          <Text variant="muted">
            The requested device could not be found.
          </Text>
        </div>
    );
  }

  return (
    <>
      <hr />

      <Text variant="muted" className='pt-4 mb-4 overflow-hidden text-nowrap overflow-ellipsis'>
        <strong>User Agent:</strong> {device && device.userAgent}
      </Text>

      <div className="grid grid-cols-2 gap-6 pt-4">
        <AdminDetailGroup>
          <AdminDetailField
            label="Language"
            value={device.language}
          />
          <AdminDetailField
            label="Timezone"
            value={device.timezone}
          />
        </AdminDetailGroup>

        <AdminDetailGroup>
          <AdminDetailField
            label="Platform"
            value={device.platform}
          />
          <AdminDetailField
            label="Version"
            value={device.appVersion || "-"}
          />
        </AdminDetailGroup>
      </div>
    </>
  );
}