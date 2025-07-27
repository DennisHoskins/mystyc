import { UserStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import Card from "@/components/ui/Card";
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
      <Card className='col-span-2 flex-1 flex'>
        <UsersDashboard
          key={'activity'}
          query={query} 
          stats={stats} 
          charts={['activity']}
        />
      </Card>
      <Card>
        <UsersDashboard 
          key={'profile'}
          query={query} 
          stats={stats} 
          charts={['profile']}
        />
      </Card>        
    </div>
  );
}