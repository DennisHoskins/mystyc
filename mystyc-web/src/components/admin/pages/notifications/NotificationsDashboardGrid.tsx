import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import NotificationsDashboard from "./NotificationsDashboard";

export default function NotificationsDashboardGrid({
  query,
  stats
} : {
  query: Partial<AdminStatsQuery> | null,
  stats: NotificationStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <div className='col-span-2 flex flex-col pb-2'>
        <NotificationsDashboard
          key={'platforms'}
          query={query} 
          stats={stats} 
          charts={['platforms']}
        />
      </div>
      <div className='flex flex-col pb-2'>
        <NotificationsDashboard 
          key={'delivery'}
          query={query} 
          stats={stats} 
          charts={['delivery']}
        />
      </div>
    </div>
  );
}