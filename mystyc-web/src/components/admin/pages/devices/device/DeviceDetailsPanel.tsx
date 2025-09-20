import { Device } from 'mystyc-common/schemas/';
import AdminDetailGrid from '@/components/admin/ui/detail/AdminDetailGrid';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import Panel from '@/components/ui/Panel';

export default function DeviceDetailsPanel({ device }: { device?: Device | null }) {
  return (
    <div className='flex flex-col space-y-4'>
      <AdminDetailGrid cols={2}>
        <Panel padding={4}>
          <AdminDetailGrid cols={2}>
            <AdminDetailField
              label="Language"
              value={device?.language}
            />
            <AdminDetailField
              label="Timezone"
              value={device?.timezone}
            />
          </AdminDetailGrid>
        </Panel>
        <Panel padding={4}>
          <AdminDetailGrid cols={2}>
            <AdminDetailField
              label="Platform"
              value={device?.platform}
            />
            <AdminDetailField
              label="Version"
              value={device && (device.appVersion || "-")}
            />
          </AdminDetailGrid>
        </Panel>
      </AdminDetailGrid>
      <AdminDetailGrid>
        <Panel padding={4}>
          <AdminDetailField
            label="User Agent"
            value={device?.userAgent}
          />
        </Panel>
      </AdminDetailGrid>
    </div>
  );
}