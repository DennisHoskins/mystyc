import { AdminStatsQuery } from 'mystyc-common/admin';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import AdminDashboardTraffic from './AdminDashboardTraffic';
import AdminDashboardSubscriptions from './AdminDashboardSubscriptions';
import AdminDashboardOpenAI from './AdminDashboardOpenAI';
import AdminDashboardSchedules from './AdminDashboardSchedules';
import AdminDashboardContent from './AdminDashboardContent';
import AdminDashboardUsers from './AdminDashboardUsers';
import AdminDashboardDevices from './AdminDashboardDevices';
import AdminDashboardNotifications from './AdminDashboardNotifications';
import AdminDashboardAuthentications from './AdminDashboardAuthentications';

export default function AdminDashboard({ query, stats } : { 
  query?: Partial<AdminStatsQuery> | null,
  stats?: AdminStatsResponseExtended | null 
}) {
  return(
    <>
      <div className="flex mb-4">
        <AdminDashboardTraffic stats={stats?.traffic} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <AdminDashboardSubscriptions stats={stats?.subscriptions} />
        <AdminDashboardOpenAI stats={stats?.openai} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <AdminDashboardSchedules stats={stats?.schedule} />
        <AdminDashboardContent stats={stats?.content} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminDashboardUsers query={query} stats={stats?.users} />
        <AdminDashboardDevices stats={stats?.devices} />
        <AdminDashboardNotifications query={query} stats={stats?.notifications} />
        <AdminDashboardAuthentications stats={stats?.authEvents} />
      </div>
    </>
  );
};