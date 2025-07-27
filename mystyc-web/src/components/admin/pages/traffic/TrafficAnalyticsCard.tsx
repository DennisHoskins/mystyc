import { TrafficStats } from '@/interfaces/admin/stats';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficAnalyticsCard({ trafficStats }: { trafficStats?: TrafficStats | null }) {
  return (
    <div className='grid grid-cols-3 gap-4'>
      <Card className='flex-1 col-span-2'>
        <div className='flex h-full min-h-[10em]'>
          <TrafficDashboard 
            data={trafficStats} 
            charts={['visitors']}
          />
        </div>        
      </Card>
      <Card className='flex-1'>
        <div className='flex h-full min-h-[10em]'>
          <TrafficDashboard 
            data={trafficStats} 
            charts={['browsers']}
          />
        </div>        
      </Card>
    </div>
  );
}