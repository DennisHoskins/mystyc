'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import TrafficIcon from '@/components/mystyc/admin/ui/icons/TrafficIcon'
import TrafficDashboard from '../traffic/TrafficDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardTraffic({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

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
              data={stats.data.traffic} 
              charts={['stats']} 
              height="100%"
            />
          </div>

          <div className="flex-1 md:h-full flex">
            <TrafficDashboard 
              className={'min-h-40'}
              data={stats.data.traffic} 
              charts={['visitors']} 
              height="100%"
            />
          </div>
        </div>
        
        <div className="h-full flex">
          <TrafficDashboard 
            className={'min-h-40'}
            data={stats.data.traffic} 
            charts={['browsers']} 
            height="100%"
          />
        </div>
        
        <div className="h-full flex">
          <TrafficDashboard 
            className={'min-h-40'}
            data={stats.data.traffic} 
            charts={['types']} 
            height="100%"
          />
        </div>
      </Link>    
    </AdminDashboardItemLayout>
  );
}
