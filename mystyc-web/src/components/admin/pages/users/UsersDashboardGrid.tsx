import { UserStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import UsersDashboard from "./UsersDashboard";

export default function UsersDashboardGrid({
  query,
  stats
} : {
  query: Partial<AdminStatsQuery> | null,
  stats: UserStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <div className='col-span-2 flex flex-col pb-2'>
        <UsersDashboard
          key={'activity'}
          query={query} 
          stats={stats} 
          charts={['activity']}
        />
      </div>
      <div className='flex flex-col pb-2'>
        <UsersDashboard 
          key={'profile'}
          query={query} 
          stats={stats} 
          charts={['profile']}
        />
      </div>        
    </div>
  );
}