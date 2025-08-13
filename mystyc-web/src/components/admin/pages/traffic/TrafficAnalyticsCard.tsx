import Card from '@/components/ui/Card';
import { TrafficStats } from '@/interfaces/admin/stats';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficAnalyticsCard({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <Card className='grid grid-cols-3 gap-4 w-full !space-y-0 grow'>
      <div className='flex-1 col-span-2'>
        <div className='flex h-[10em]'>
          <TrafficDashboard 
            data={trafficStats} 
            charts={['visitors']}
          />
        </div>        
      </div>
      <div className='flex-1'>
        <div className='flex h-[10em]'>
          <TrafficDashboard 
            data={trafficStats} 
            charts={['browsers']}
          />
        </div>        
      </div>
    </Card>
  );
}