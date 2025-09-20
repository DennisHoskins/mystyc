import { TrafficStats } from '@/interfaces/admin/stats';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficMainPanel({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 min-h-0 !space-y-0">
      <TrafficDashboard 
        data={trafficStats} 
        charts={['dayofweek']}
        layout={'vertical'}
        className='min-h-[12em]'
      />
      <TrafficDashboard 
        data={trafficStats} 
        charts={['hourly']}
        layout={'vertical'}
        className='min-h-[12em]'
      />
      <TrafficDashboard
        data={trafficStats} 
        charts={['pages']}
        layout={'vertical'}
        className='min-h-[12em]'
      />
    </div>
  );
}