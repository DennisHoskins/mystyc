import { DeviceStats } from 'mystyc-common/admin/interfaces/stats';
import Card from "@/components/ui/Card";
import DevicesDashboard from "./DevicesDashboard";

export default function DevicesDashboardGrid({
  stats
} : {
  stats: DeviceStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <Card className='col-span-2 flex-1 flex'>
        <DevicesDashboard
          key={'activity'}
          stats={stats} 
          charts={['activity']}
        />
      </Card>
      <Card>
        <DevicesDashboard 
          key={'platforms'}
          stats={stats} 
          charts={['platforms']}
        />
      </Card>        
    </div>
  );
}