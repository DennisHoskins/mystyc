  import { AdminStatsQuery } from 'mystyc-common/admin';
import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import AdminDashboardTraffic from './AdminDashboardTraffic';
import AdminDashboardSubscriptions from './AdminDashboardSubscriptions';
import AdminDashboardOpenAI from './AdminDashboardOpenAI';
import AdminDashboardSchedules from './AdminDashboardSchedules';
import AdminDashboardUsers from './AdminDashboardUsers';
import AdminDashboardDevices from './AdminDashboardDevices';
import AdminDashboardNotifications from './AdminDashboardNotifications';
import AdminDashboardAuthentications from './AdminDashboardAuthentications';

export default function AdminDashboard({ query, stats } : { 
  query?: Partial<AdminStatsQuery> | null,
  stats?: AdminStatsResponseExtended | null 
}) {
  return(
    <div className="grow w-full grid gap-1 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
      <AdminDashboardTraffic stats={stats?.traffic} className='order-1 col-span-2 md:col-span-4 lg:col-span-6 xl:col-span-12' />

      <AdminDashboardSubscriptions stats={stats?.subscriptions} className='min-h-[12em] order-2 col-span-2 md:col-span-4 lg:col-span-4 xl:order-4 xl:col-span-5' />
      <AdminDashboardOpenAI stats={stats?.openai} className='min-h-[12em] order-3 col-span-1 md:col-span-2 lg:col-span-2 xl:order-2 xl:col-span-4' />

      <AdminDashboardSchedules stats={stats?.schedule} className='min-h-[12em] order-4 col-span-2 md:col-span-3' />

      <AdminDashboardUsers query={query} stats={stats?.users} className='min-h-[10em] order-6 col-span-2 md:col-span-2 lg:col-span-3' />
      <AdminDashboardDevices stats={stats?.devices} className='min-h-[10em] order-7 col-span-2 md:col-span-2 lg:col-span-3' />
      <AdminDashboardNotifications query={query} stats={stats?.notifications} className='min-h-[10em] order-8 col-span-2 md:col-span-2 lg:col-span-3' />
      <AdminDashboardAuthentications stats={stats?.authEvents} className='min-h-[10em] order-9 col-span-2 md:col-span-2 lg:col-span-3' />
    </div>
  );
};