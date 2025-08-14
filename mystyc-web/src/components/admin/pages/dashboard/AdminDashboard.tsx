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
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4">
      <AdminDashboardTraffic stats={stats?.traffic} className='col-span-1 lg:col-span-12' />

      <AdminDashboardSchedules stats={stats?.schedule} className='col-span-1 lg:col-span-4 xl:col-span-3' />
      <AdminDashboardContent stats={stats?.content} className='col-span-1 lg:col-span-8 xl:col-span-9' />

      <AdminDashboardSubscriptions stats={stats?.subscriptions} className='col-span-1 lg:col-span-8' />
      <AdminDashboardOpenAI stats={stats?.openai} className='col-span-1 lg:col-span-4' />

      <AdminDashboardUsers query={query} stats={stats?.users} className='col-span-1 lg:col-span-6 xl:col-span-3' />
      <AdminDashboardDevices stats={stats?.devices} className='col-span-1 lg:col-span-6 xl:col-span-3' />
      <AdminDashboardNotifications query={query} stats={stats?.notifications} className='col-span-1 lg:col-span-6 xl:col-span-3' />
      <AdminDashboardAuthentications stats={stats?.authEvents} className='col-span-1 lg:col-span-6 xl:col-span-3' />
    </div>
  );
};