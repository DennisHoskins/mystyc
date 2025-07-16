'use client';

import { AdminStatsResponseExtended } from '@/interfaces';
import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import AdminDashboardTraffic from './AdminDashboardTraffic';
import AdminDashboardSubscriptions from './AdminDashboardSubscriptions';
import AdminDashboardOpenAI from './AdminDashboardOpenAI';
import AdminDashboardSchedules from './AdminDashboardSchedules';
import AdminDashboardContent from './AdminDashboardContent';
import AdminDashboardUsers from './AdminDashboardUsers';
import AdminDashboardDevices from './AdminDashboardDevices';
import AdminDashboardNotifications from './AdminDashboardNotifications';
import AdminDashboardAuthentications from './AdminDashboardAuthentications';

export default function AdminDashboard({ stats } : { stats?: StatsResponseWithQuery<AdminStatsResponseExtended> | null }) {
  if (!stats) {
    return;
  }

  return(
    <>
      <AdminDashboardTraffic stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 min-h-[15em]">
        <AdminDashboardSubscriptions stats={stats} />
        <AdminDashboardOpenAI stats={stats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
        <AdminDashboardSchedules stats={stats} />
        <AdminDashboardContent stats={stats} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        <AdminDashboardUsers stats={stats} />
        <AdminDashboardDevices stats={stats} />
        <AdminDashboardNotifications stats={stats} />
        <AdminDashboardAuthentications stats={stats} />
      </div>
    </>
  );
};