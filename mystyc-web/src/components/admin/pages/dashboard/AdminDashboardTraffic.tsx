import { TrafficStats } from '@/interfaces/admin/stats';
import Link from '@/components/ui/Link';
import TrafficIcon from '@/components/admin/ui/icons/TrafficIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import TrafficDashboard from '../traffic/TrafficDashboard';

export default function AdminDashboardTraffic({ stats, className } : { 
  stats?: TrafficStats | null,
  className?: string
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<TrafficIcon />}
      title="Website Traffic"
      link="/admin/traffic"
      stats={
        <Link href='/admin/traffic'>
          <TrafficDashboard 
            data={stats} 
            charts={['stats']} 
          />
        </Link>
      }
    >
      <Link 
        href='/admin/traffic'
        className="w-full flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4"
      >
        <div className="col-span-1 lg:col-span-2 flex">
          <TrafficDashboard 
            data={stats} 
            charts={['visitors']}
            height={100} 
          />
        </div>
        
        <TrafficDashboard 
          data={stats} 
          charts={['browsers']} 
          height={100} 
        />
        
        <TrafficDashboard 
          data={stats} 
          charts={['types']} 
          height={100} 
        />
      </Link>    
    </AdminDashboardItemLayout>
  );
}
