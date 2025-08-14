import { TrafficStats } from '@/interfaces/admin/stats';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficAnalyticsPanel({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <div className='grid grid-cols-5 gap-4 w-full !mt-2 !space-y-0 grow flex-1'>
      <div className='flex-1 col-span-3'>
        <div className='flex h-[10em]'>
          <TrafficDashboard 
            data={trafficStats} 
            charts={['visitors']}
          />
        </div>        
      </div>
      <div className='flex-1 col-span-2'>
        <div className='flex h-[10em]'>
          <TrafficDashboard 
            data={trafficStats} 
            charts={['browsers']}
          />
        </div>        
      </div>
    </div>
  );
}