import { TrafficStats } from '@/interfaces/admin/stats';

import TrafficDashboard from './TrafficDashboard';

export default function TrafficSidebarPanel({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <div className='flex-1 flex flex-col space-y-4'>
      <TrafficDashboard 
        data={trafficStats} 
        charts={['stats']}
      />
      <TrafficDashboard 
        data={trafficStats} 
        charts={['pages']}
        layout={'vertical'}
      />
    </div>
  );
}