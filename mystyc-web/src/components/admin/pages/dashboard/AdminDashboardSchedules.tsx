import { AdminStatsResponseExtended } from '@/interfaces/admin/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import Link from '@/components/ui/Link';
import ScheduleIcon from '@/components/admin/ui/icons/ScheduleIcon'
import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import SchedulesDashboard from '../schedules/SchedulesDashboard';
import SchedulesExecutionsDashboard from '../schedule-executions/SchedulesExecutionsDashboard';

export default function AdminDashboardSchedules({ stats } : { stats?: AdminStatsResponseWithQuery<AdminStatsResponseExtended> | null }) {

  const dataSchedules = stats?.data.schedule ? {
    data: stats.data.schedule,
    query: stats.query,
    queryString: stats.queryString,
  } : null;

  const dataExecutions = stats?.data.schedule.executions ? {
    data: stats.data.schedule.executions,
    query: stats.query,
    queryString: stats.queryString,
  } : null;

  return (
    <AdminDashboardItemLayout
      className='col-span-1 flex flex-col'
      icon={<ScheduleIcon />}
      title="Schedules"
      link="/admin/schedules"
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className='flex-1 flex flex-col'>
          <Link
            className='flex-1 flex flex-col'
            href='/admin/schedules'
          >
            <SchedulesDashboard
              className="mb-2"
              stats={dataSchedules}
              charts={['health']}
            />
            <SchedulesDashboard 
              stats={dataSchedules}
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
                stats={dataExecutions}
                charts={['stats']}
              />
              <SchedulesExecutionsDashboard
                stats={dataExecutions}
                charts={['today']}
              />
            </div>
          </Link>
      </div>
    </AdminDashboardItemLayout>
  );
}