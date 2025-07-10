'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import UsersIcon from '@/components/app/mystyc/admin/ui/icons/UsersIcon';
import DevicesIcon from '@/components/app/mystyc/admin/ui/icons/DevicesIcon';
import AuthenticationIcon from '@/components/app/mystyc/admin/ui/icons/AuthenticationIcon';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon';
import ScheduleIcon from '@/components/app/mystyc/admin/ui/icons/ScheduleIcon'
import ContentIcon from '@/components/app/mystyc/admin/ui/icons/ContentIcon'
import SubscriberIcon from '@/components/app/mystyc/admin/ui/icons/SubscriberIcon'
import AiIcon from '@/components/app/mystyc/admin/ui/icons/AiIcon'
import TrafficIcon from '@/components/app/mystyc/admin/ui/icons/TrafficIcon'

import TrafficDashboard from '../traffic/TrafficDashboard';
import UsersDashboard from '../users/UsersDashboard';
import DevicesDashboard from '../devices/DevicesDashboard';
import SchedulesDashboard from '../schedules/SchedulesDashboard';
import SchedulesExecutionsDashboard from '../schedules/executions/SchedulesExecutionsDashboard';
import ContentDashboard from '../contents/ContentDashboard';
import AuthenticationDashboard from '../authentications/AuthenticationDashboard';
import NotificationsDashboard from '../notifications/NotificationsDashboard';
import Link from '@/components/ui/Link';

export default function AdminDashboard({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

console.log(stats);

  return(
    <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 min-h-[15em]">
        <AdminDashboardItemLayout
          className='col-span-1 flex flex-col'
          icon={<SubscriberIcon />}
          title="Subscribers"
          link="/admin/subscribers"
        >
          Subscribers
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          className='col-span-1 flex flex-col'
          icon={<AiIcon />}
          title="Open AI"
          link="/admin/openai"
        >
          Open AI
        </AdminDashboardItemLayout>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <AdminDashboardItemLayout
          className='col-span-1 flex flex-col'
          icon={<ScheduleIcon />}
          title="Schedules"
          link="/admin/schedules"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className='flex'
                href='/admin/schedules/executions'
              >
                <div className='flex-1 space-y-4'>
                  <SchedulesExecutionsDashboard
                    data={stats.data.schedule.executions} 
                    charts={['stats']}
                  />
                  <SchedulesExecutionsDashboard
                    data={stats.data.schedule.executions} 
                    charts={['today']}
                  />
                </div>
              </Link>
          </div>
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          className='col-span-2'
          icon={<ContentIcon />}
          title="Content Generation"
          link="/admin/content"
        >
          <Link 
            href='admin/content'
            className='space-x-4 flex'
          >
            <ContentDashboard 
              className='max-w-28'
              stats={{
                data: stats.data.content,
                query: stats.query,
                queryString: stats.queryString,
              }}
              charts={['stats']}
            />
            <ContentDashboard 
              stats={{
                data: stats.data.content,
                query: stats.query,
                queryString: stats.queryString,
              }}
              charts={['timeline']}
            />
          </Link>
        </AdminDashboardItemLayout>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        <AdminDashboardItemLayout
          icon={<UsersIcon />}
          title="Users"
          link="/admin/users"
        >
          <Link
            className='flex-1 flex flex-col'
            href='/admin/users'
          >
            <UsersDashboard 
              stats={{
                data: stats.data.users,
                query: stats.query,
                queryString: stats.queryString,
              }}
              charts={['stats', 'registrations', 'activity']} 
              height={100}
            />
          </Link>
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          icon={<DevicesIcon />}
          title="Devices"
          link="/admin/devices"
        >
          <Link
            className='flex-1 flex flex-col'
            href='/admin/devices'
          >
            <DevicesDashboard 
              stats={{
                data: stats.data.devices,
                query: stats.query,
                queryString: stats.queryString,
              }}
              charts={['stats', 'browsers', 'activity'] }
              height={100}
            />
          </Link>
        </AdminDashboardItemLayout>
        
        <AdminDashboardItemLayout
          icon={<NotificationIcon />}
          title="Notifications"
          link="/admin/notifications"
        >
          <Link
            className='flex-1 flex flex-col'
            href='/admin/notifications'
          >
            <NotificationsDashboard 
              stats={{
                data: stats.data.notifications,
                query: stats.query,
                queryString: stats.queryString,
              }}
              charts={['stats', 'volume', 'platforms']}
              height={100}
            />
          </Link>
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          icon={<AuthenticationIcon />}
          title="Authentication"
          link="/admin/authentication"
        >
          <Link
            className='flex-1 flex flex-col'
            href='/admin/authentication'
          >
            <AuthenticationDashboard 
              stats={{
                data: stats.data.authEvents,
                query: stats.query,
                queryString: stats.queryString,
              }}
              charts={['stats', 'peak', 'duration']}
              height={100}
            />
          </Link>
        </AdminDashboardItemLayout>
      </div>
    </>
  );
};