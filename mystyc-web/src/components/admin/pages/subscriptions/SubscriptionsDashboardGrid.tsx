import { SubscriptionStats } from 'mystyc-common/admin/interfaces/stats';
import SubscriptionsDashboard from "./SubscriptionsDashboard";

export default function SubscriptionsDashboardGrid({
  stats
} : {
  stats: SubscriptionStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <div className='col-span-2 flex-1 flex'>
        <SubscriptionsDashboard
          key={'mrr'}
          stats={stats} 
          charts={['mrr']}
        />
      </div>
      <div className='flex flex-col flex-1'>
        <SubscriptionsDashboard 
          key={'tiers'}
          stats={stats} 
          charts={['tiers']}
        />
      </div>        
    </div>
  );
}