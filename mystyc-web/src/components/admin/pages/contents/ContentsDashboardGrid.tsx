import { ContentStats } from 'mystyc-common/admin/interfaces/stats';
import ContentDashboard from "./ContentDashboard";

export default function ContentsDashboardGrid({
  stats
} : {
  stats: ContentStats | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <div className='col-span-2 flex flex-col pb-2'>
        <ContentDashboard
          key={'timeline'}
          stats={stats} 
          charts={['timeline']}
        />
      </div>
      <div className='flex flex-col pb-2'>
        <ContentDashboard 
          key={'coverage'}
          stats={stats} 
          charts={['coverage']}
        />
      </div>
    </div>
  );
}