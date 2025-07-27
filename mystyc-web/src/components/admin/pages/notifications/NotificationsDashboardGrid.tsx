import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import Card from "@/components/ui/Card";
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
      <Card className='col-span-2 flex-1 flex'>
        <NotificationsDashboard
          key={'platforms'}
          query={query} 
          stats={stats} 
          charts={['platforms']}
        />
      </Card>
      <Card>
        <NotificationsDashboard 
          key={'delivery'}
          query={query} 
          stats={stats} 
          charts={['delivery']}
        />
      </Card>        
    </div>
  );
}