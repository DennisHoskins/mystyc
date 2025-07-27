import { DeviceStats } from 'mystyc-common/admin';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import DevicesDashboard from '../devices/DevicesDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardDevices({ stats } : { 
  stats?: DeviceStats | null 
}) {
  return (
    <AdminDashboardItemLayout
      icon={<DevicesIcon />}
      title="Devices"
      link="/admin/devices"
    >
      <Link
        className='flex-1 flex flex-col'
        href='/admin/devices'
      >
        <DevicesDashboard 
          stats={stats}
          charts={['stats', 'browsers', 'activity'] }
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}