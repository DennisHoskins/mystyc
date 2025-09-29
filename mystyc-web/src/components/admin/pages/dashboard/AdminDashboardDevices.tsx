import { DeviceStats } from 'mystyc-common/admin';
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import DevicesDashboard from '../devices/DevicesDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardDevices({ stats, className } : { 
  stats?: DeviceStats | null,
  className?: string
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<DevicesIcon />}
      title="Devices"
      link="/admin/devices"
      stats={
        <Link href='/admin/devices'>
          <DevicesDashboard 
            stats={stats}
            charts={['stats'] }
          />
        </Link>
      }
    >
      <Link
        className='flex-1 flex'
        href='/admin/devices'
      >
        <DevicesDashboard 
          stats={stats}
          charts={['browsers'] }
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}