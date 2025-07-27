import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import AdminDashboardTraffic from './AdminDashboardTraffic';
import AdminDashboardSubscriptions from './AdminDashboardSubscriptions';
import AdminDashboardOpenAI from './AdminDashboardOpenAI';
import AdminDashboardSchedules from './AdminDashboardSchedules';
import AdminDashboardContent from './AdminDashboardContent';
import AdminDashboardUsers from './AdminDashboardUsers';
import AdminDashboardDevices from './AdminDashboardDevices';
import AdminDashboardNotifications from './AdminDashboardNotifications';
import AdminDashboardAuthentications from './AdminDashboardAuthentications';

export default function AdminDashboard({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  return(
    <>
      <div className="flex mb-4">
        <AdminDashboardTraffic stats={stats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <AdminDashboardSubscriptions stats={stats} />
        <AdminDashboardOpenAI stats={stats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <AdminDashboardSchedules stats={stats} />
        <AdminDashboardContent stats={stats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminDashboardUsers stats={stats?.data} query={stats?.query} />
        <AdminDashboardDevices stats={stats?.data} />
        <AdminDashboardNotifications stats={stats?.data} />
        <AdminDashboardAuthentications stats={stats?.data} />
      </div>
    </>
  );
};