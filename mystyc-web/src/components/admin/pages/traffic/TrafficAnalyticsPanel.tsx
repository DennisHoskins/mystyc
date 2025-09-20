import { TrafficStats } from '@/interfaces/admin/stats';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficAnalyticsPanel({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <div className='min-h-[12em] grid grid-cols-5 gap-4 mb-4 w-full !space-y-0 grow flex-1'>
      <div className='flex-1 flex col-span-3'>
        <TrafficDashboard 
          data={trafficStats} 
          charts={['visitors']}
        />
      </div>        
      <div className='flex-1 flex col-span-2'>
        <TrafficDashboard 
          data={trafficStats} 
          charts={['browsers']}
        />
      </div>
    </div>
  );
}