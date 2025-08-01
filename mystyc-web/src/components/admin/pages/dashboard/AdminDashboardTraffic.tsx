import { TrafficStats } from '@/interfaces/admin/stats';
import Link from '@/components/ui/Link';
import TrafficIcon from '@/components/admin/ui/icons/TrafficIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import TrafficDashboard from '../traffic/TrafficDashboard';

export default function AdminDashboardTraffic({ stats } : { 
  stats?: TrafficStats | null 
}) {
  return (
    <AdminDashboardItemLayout
      icon={<TrafficIcon />}
      title="Website Traffic"
      link="/admin/traffic"
    >
      <Link 
        href='/admin/traffic'
        className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"
      >
        <div className="col-span-1 sm:col-span-2 xl:col-span-3 h-full flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className='w-full sm:w-32 h-full flex'>
            <TrafficDashboard 
              data={stats} 
              charts={['stats']} 
              height="100%"
            />
          </div>

          <div className="flex-1 md:h-full flex">
            <TrafficDashboard 
              className={'min-h-40'}
              data={stats} 
              charts={['visitors']} 
              height="100%"
            />
          </div>
        </div>
        
        <div className="h-full flex">
          <TrafficDashboard 
            className={'min-h-40'}
            data={stats} 
            charts={['browsers']} 
            height="100%"
          />
        </div>
        
        <div className="h-full flex">
          <TrafficDashboard 
            className={'min-h-40'}
            data={stats} 
            charts={['types']} 
            height="100%"
          />
        </div>
      </Link>    
    </AdminDashboardItemLayout>
  );
}
