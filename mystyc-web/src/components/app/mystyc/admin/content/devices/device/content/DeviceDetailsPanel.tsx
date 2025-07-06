'use client';

import { Device } from '@/interfaces';

import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/app/mystyc/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/app/mystyc/admin/ui/detail/AdminDetailField';

export default function DeviceDetailsPanel({ device }: { device: Device }) {
  return (
    <div className='flex flex-col min-h-16'>
      <Text variant="muted" className='mb-2 overflow-hidden text-nowrap overflow-ellipsis'>
        <strong> {device && device.userAgent}</strong>
      </Text>

      <div className="grid grid-cols-2 gap-6">
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
    </div>
  );
}