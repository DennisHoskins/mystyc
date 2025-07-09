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

import TrafficDashboard from './TrafficDashboard';
import UsersDashboard from './UsersDashboard';
import DevicesDashboard from './DevicesDashboard';
import ScheduleDashboard from './ScheduleDashboard';
import ContentDashboard from './ContentDashboard';
import AuthenticationDashboard from './AuthenticationDashboard';
import NotificationsDashboard from './NotificationsDashboard';

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
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          
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
      </div>    
      </AdminDashboardItemLayout>

      <div className="grid grid-cols-1 md:grid-cols-5 xl:grid-cols-10 gap-4 my-4">
        <AdminDashboardItemLayout
          className='col-span-1 md:col-span-2 xl:col-span-2 flex flex-col'
          icon={<ScheduleIcon />}
          title="Scheduler"
          link="/admin/scheduler"
        >
          <ScheduleDashboard
            className="mb-2"
            data={stats.data.schedule} 
            charts={['health']}
          />
          <ScheduleDashboard 
            data={stats.data.schedule} 
            charts={['next']}
          />
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          className='col-span-1 md:col-span-3 xl:col-span-3 flex flex-col'
          icon={<ContentIcon />}
          title="Content Generation"
          link="/admin/content"
        >
          <ContentDashboard 
            stats={{
              data: stats.data.content,
              query: stats.query,
              queryString: stats.queryString,
            }}
            charts={['timeline']}
          />
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          className='col-span-1 md:col-span-3 xl:col-span-3 flex flex-col'
          icon={<SubscriberIcon />}
          title="Subscriptions"
          link="/admin/subscriptions"
        >
          Subscriptions
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          className='col-span-1 md:col-span-2 xl:col-span-2 flex flex-col'
          icon={<AiIcon />}
          title="Open AI"
          link="/admin/content"
        >
          Tokens
        </AdminDashboardItemLayout>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        <AdminDashboardItemLayout
          icon={<UsersIcon />}
          title="Users"
          link="/admin/users"
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
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          icon={<DevicesIcon />}
          title="Devices"
          link="/admin/devices"
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
        </AdminDashboardItemLayout>
        
        <AdminDashboardItemLayout
          icon={<NotificationIcon />}
          title="Notifications"
          link="/admin/notifications"
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
        </AdminDashboardItemLayout>

        <AdminDashboardItemLayout
          icon={<AuthenticationIcon />}
          title="Authentication"
          link="/admin/authentication"
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
        </AdminDashboardItemLayout>
      </div>
    </>
  );
};