import { Device } from 'mystyc-common/schemas/';

import Text from '@/components/ui/Text';
import AdminDetailGroup from '@/components/admin/ui/detail/AdminDetailGroup';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';

export default function DeviceDetailsPanel({ device }: { device?: Device | null }) {
  return (
    <div className='flex flex-col space-y-4'>
      <AdminDetailGroup cols={1}>
        <AdminDetailField
          label="User Agent"
          value={device?.userAgent}
        />
      </AdminDetailGroup>
      <AdminDetailGroup cols={2}>
        <AdminDetailField
          label="Language"
          value={device?.language}
        />
        <AdminDetailField
          label="Timezone"
          value={device?.timezone}
        />
        <AdminDetailField
          label="Platform"
          value={device?.platform}
        />
        <AdminDetailField
          label="Version"
          value={device && (device.appVersion || "-")}
        />
      </AdminDetailGroup>
    </div>
  );
}