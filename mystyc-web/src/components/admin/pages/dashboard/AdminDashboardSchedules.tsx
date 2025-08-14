import { ScheduleStats, ScheduleExecutionStats } from 'mystyc-common/admin';
import Link from '@/components/ui/Link';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import SchedulesDashboard from '../schedules/SchedulesDashboard';
import SchedulesExecutionsDashboard from '../schedule-executions/SchedulesExecutionsDashboard';

export default function AdminDashboardSchedules({ stats, className } : { 
  stats?: ScheduleStats & {executions: ScheduleExecutionStats} | null,
  className?: string
}) {
  return (
    <AdminDashboardItemLayout
      className={className}
      icon={<ScheduleIcon />}
      title="Schedules"
      link="/admin/schedules"
      stats={
        <Link href='/admin/schedule-executions'>
          <SchedulesExecutionsDashboard
            stats={stats?.executions}
            charts={['stats']}
          />
        </Link>
      }
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className='flex-1 flex flex-col'>
          <Link
            className='flex-1 flex flex-col'
            href='/admin/schedules'
          >
            <SchedulesDashboard
              className="mb-2"
              stats={stats}
              charts={['health']}
            />
            <SchedulesDashboard 
              stats={stats}
              charts={['today']}
            />
          </Link>
        </div>
          <Link
            className='flex flex-1'
            href='/admin/schedule-executions'
          >
            <div className='flex-1 flex flex-col space-y-4'>
              <SchedulesExecutionsDashboard
                stats={stats?.executions}
                charts={['today']}
              />
            </div>
          </Link>
      </div>
    </AdminDashboardItemLayout>
  );
}