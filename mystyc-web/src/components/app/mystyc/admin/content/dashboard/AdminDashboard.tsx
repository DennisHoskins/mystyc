'use client';

import { AdminStatsResponse } from '@/interfaces';

import AdminDashboardItemLayout from './AdminDashboardItemLayout';
import UsersIcon from '@/components/app/mystyc/admin/ui/icons/UsersIcon';
import DevicesIcon from '@/components/app/mystyc/admin/ui/icons/DevicesIcon';
import AuthenticationIcon from '@/components/app/mystyc/admin/ui/icons/AuthenticationIcon';
import NotificationIcon from '@/components/app/mystyc/admin/ui/icons/NotificationIcon';

import UsersDashboard from './UsersDashboard';
import DevicesDashboard from './DevicesDashboard';
import AuthenticationDashboard from './AuthenticationDashboard';
import NotificationsDashboard from './NotificationsDashboard';

export default function AdminDashboard({ data } : { data?: AdminStatsResponse | null }) {
  if (!data) {
    return;
  }

  return(
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
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
    </div>
  );
};