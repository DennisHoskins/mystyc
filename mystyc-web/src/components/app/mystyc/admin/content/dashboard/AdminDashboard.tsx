'use client';

import { AdminStatsResponse } from '@/interfaces';

import AdminDashboardUsers from './AdminDashboardUsers';
import AdminDashboardDevices from './AdminDashboardDevices';
import AdminDashboardAuthentication from './AdminDashboardAuthentication';
import AdminDashboardNotifications from './AdminDashboardNotifications';

export default function AdminDashboard({ data } : { data?: AdminStatsResponse | null }) {
  if (!data) {
    return;
  }

  return(
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <AdminDashboardUsers data={data.users} />
      <AdminDashboardDevices data={data.devices} />
      <AdminDashboardAuthentication data={data.authEvents} />
      <AdminDashboardNotifications data={data.notifications} />
    </div>
  );
};