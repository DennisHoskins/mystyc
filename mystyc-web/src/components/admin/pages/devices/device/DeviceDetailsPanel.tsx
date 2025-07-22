'use client';

import { Device } from 'mystyc-common/schemas/';

import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function DeviceDetailsPanel({ device }: { device: Device }) {
  return (
    <div className='flex flex-col min-h-16'>
      <div className='flex flex-col mb-4 space-y-1'>
        <Text variant="small" className="font-light text-gray-500 uppercase tracking-wide mr-2">
          User Agent
        </Text>
        <Text variant="muted" className='overflow-hidden text-nowrap overflow-ellipsis'>
          <strong>{device && device.userAgent}</strong>
        </Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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