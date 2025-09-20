import { DeviceStats } from 'mystyc-common/admin/interfaces/stats';
import DevicesDashboard from "./DevicesDashboard";

export default function DevicesDashboardGrid({
  stats
} : {
  stats: DeviceStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <div className='col-span-2 flex flex-col pb-2'>
        <DevicesDashboard
          key={'activity'}
          stats={stats} 
          charts={['activity']}
        />
      </div>
      <div className='flex flex-col pb-2'>
        <DevicesDashboard 
          key={'platforms'}
          stats={stats} 
          charts={['platforms']}
        />
      </div>
    </div>
  );
}