'use client';

import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import Card from "@/components/ui/Card";
import NotificationsDashboard from "./NotificationsDashboard";

export default function NotificationsDashboardGrid({
  stats
} : {
  stats: AdminStatsResponseWithQuery<NotificationStats> | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <Card className='col-span-2 flex-1 flex'>
        <NotificationsDashboard
          key={'volume'}
          stats={stats} 
          charts={['volume']}
        />
      </Card>
      <Card>
        <NotificationsDashboard 
          key={'delivery'}
          stats={stats} 
          charts={['delivery']}
        />
      </Card>        
    </div>
  );
}