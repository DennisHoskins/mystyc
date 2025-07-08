'use client';

import { AdminStatsResponse } from '@/interfaces';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import UsersIcon from '@/components/app/mystyc/admin/ui/icons/UsersIcon';
import DevicesIcon from '@/components/app/mystyc/admin/ui/icons/DevicesIcon';
import AuthenticationIcon from '@/components/app/mystyc/admin/ui/icons/AuthenticationIcon';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon';
import TrafficIcon from '@/components/app/mystyc/admin/ui/icons/TrafficIcon'

import TrafficDashboard from './TrafficDashboard';
import UsersDashboard from './UsersDashboard';
import DevicesDashboard from './DevicesDashboard';
import AuthenticationDashboard from './AuthenticationDashboard';
import NotificationsDashboard from './NotificationsDashboard';

export default function AdminDashboard({ data } : { data?: AdminStatsResponse | null }) {
  if (!data) {
    return;
  }

  return(
    <>
      <AdminDashboardItemLayout
        icon={<TrafficIcon />}
        title="Website Traffic"
        link="/admin/traffic"
      >
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 h-[30em] xl:h-full">

        <div className="col-span-1 sm:col-span-2 xl:col-span-3 h-full flex space-x-4">
          <div className='w-32 h-full flex'>
            <TrafficDashboard 
              data={data.traffic} 
              charts={['stats']} 
              height="100%"
            />
          </div>

          <TrafficDashboard 
            data={data.traffic} 
            charts={['visitors']} 
            height="100%"
          />
        </div>
        
        <div className="h-full flex">
          <TrafficDashboard 
            data={data.traffic} 
            charts={['browsers']} 
            height="100%"
          />
        </div>
        
        <div className="h-full flex">
          <TrafficDashboard 
            data={data.traffic} 
            charts={['types']} 
            height="100%"
          />
        </div>

      </div>
    </AdminDashboardItemLayout>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        <AdminDashboardItemLayout
          icon={<UsersIcon />}
          title="Users"
          link="/admin/users"
        >
          <UsersDashboard 
            data={data.users} 
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
            data={data.devices} 
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
            data={data.notifications} 
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
            data={data.authEvents} 
            charts={['stats', 'peak', 'duration']}
            height={100}
          />
        </AdminDashboardItemLayout>
      </div>
    </>
  );
};