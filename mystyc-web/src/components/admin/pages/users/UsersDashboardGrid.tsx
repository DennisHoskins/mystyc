'use client';

import { UserStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import Card from "@/components/ui/Card";
import UsersDashboard from "./UsersDashboard";

export default function UsersDashboardGrid({
  stats
} : {
  stats: AdminStatsResponseWithQuery<UserStats> | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <Card className='col-span-2 flex-1 flex'>
        <UsersDashboard
          key={'activity'}
          stats={stats} 
          charts={['activity']}
        />
      </Card>
      <Card>
        <UsersDashboard 
          key={'profile'}
          stats={stats} 
          charts={['profile']}
        />
      </Card>        
    </div>
  );
}