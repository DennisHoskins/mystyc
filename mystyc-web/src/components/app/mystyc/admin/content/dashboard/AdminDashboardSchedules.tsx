'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import ScheduleIcon from '@/components/app/mystyc/admin/ui/icons/ScheduleIcon'
import SchedulesDashboard from '../schedules/SchedulesDashboard';
import SchedulesExecutionsDashboard from '../schedule-executions/SchedulesExecutionsDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboardSchedules({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

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
              stats={{
                data: stats.data.schedule,
                query: stats.query,
                queryString: stats.queryString,
              }}
              charts={['health']}
            />
            <SchedulesDashboard 
              stats={{
                data: stats.data.schedule,
                query: stats.query,
                queryString: stats.queryString,
              }}
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
                stats={{
                  data: stats.data.schedule.executions,
                  query: stats.query,
                  queryString: stats.queryString,
                }}
                charts={['stats']}
              />
              <SchedulesExecutionsDashboard
                stats={{
                  data: stats.data.schedule.executions,
                  query: stats.query,
                  queryString: stats.queryString,
                }}
                charts={['today']}
              />
            </div>
          </Link>
      </div>
    </AdminDashboardItemLayout>
  );
}