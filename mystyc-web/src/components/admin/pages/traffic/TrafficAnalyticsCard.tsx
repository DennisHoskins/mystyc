import { TrafficStats } from '@/interfaces/admin/stats';

import Card from '@/components/ui/Card';
import Heading from '@/components/ui/Heading';
import TrafficDashboard from './TrafficDashboard';

export default function TrafficAnalyticsCard({ trafficStats }: { trafficStats: TrafficStats }) {
  return (
    <Card className='flex-1'>
      <Heading level={4} className="mb-4 text-blue-900">Visitor Analytics</Heading>
      <div className='flex h-full min-h-[17em]'>
        <TrafficDashboard 
          data={trafficStats} 
          charts={['visitors']}
        />
      </div>        
    </Card>
  );
}