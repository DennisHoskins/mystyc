'use client';

import { TrafficStats } from '@/interfaces';

import TrafficDashboard from '../../dashboard/TrafficDashboard';

export default function TrafficSidebarPanel({ trafficStats }: { trafficStats: TrafficStats }) {

  return (
    <div className='flex flex-col space-y-4'>
      <TrafficDashboard 
        data={trafficStats} 
        charts={['stats']}
      />
      <TrafficDashboard 
        data={trafficStats} 
        charts={['platform']}
        height={150}
      />
      <TrafficDashboard 
        data={trafficStats} 
        charts={['pages']}
        height={200}
        layout={'vertical'}
      />
    </div>
  );
}