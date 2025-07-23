import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import DevicesIcon from '@/components/admin/ui/icons/DevicesIcon';
import DevicesDashboard from '../devices/DevicesDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardDevices({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

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
          stats={{
            data: stats.data.devices,
            query: stats.query,
            queryString: stats.queryString,
          }}
          charts={['stats', 'browsers', 'activity'] }
          height={100}
        />
      </Link>
    </AdminDashboardItemLayout>
  );
}