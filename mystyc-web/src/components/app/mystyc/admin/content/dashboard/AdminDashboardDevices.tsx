'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import DevicesIcon from '@/components/app/mystyc/admin/ui/icons/DevicesIcon';
import DevicesDashboard from '../devices/DevicesDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardDevices({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
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