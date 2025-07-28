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
      <div className="mb-4 grid grid-cols-1 2xl:grid-cols-4 gap-4">
        <div className='col-span-1 2xl:col-span-3'>
          <AdminDashboardTraffic stats={stats?.traffic} />
        </div>
        <div className='hidden 2xl:flex col-span-1'>
          <AdminDashboardSubscriptions stats={stats?.subscriptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 mb-4">
        <div className='flex 2xl:hidden'>
          <AdminDashboardSubscriptions stats={stats?.subscriptions} />
        </div>
        <div className='flex'>
          <AdminDashboardOpenAI stats={stats?.openai} />
        </div>
        <div className='hidden 2xl:flex'>
          <AdminDashboardSchedules stats={stats?.schedule} />
        </div>
        <div className='hidden 2xl:flex'>
          <AdminDashboardContent stats={stats?.content} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 2xl:hidden">
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