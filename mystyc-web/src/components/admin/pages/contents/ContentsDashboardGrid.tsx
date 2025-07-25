'use client';

import { ContentStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import Card from "@/components/ui/Card";
import ContentDashboard from "./ContentDashboard";

export default function ContentsDashboardGrid({
  stats
} : {
  stats: AdminStatsResponseWithQuery<ContentStats> | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <Card className='col-span-2 flex-1 flex'>
        <ContentDashboard
          key={'timeline'}
          stats={stats} 
          charts={['timeline']}
        />
      </Card>
      <Card>
        <ContentDashboard 
          key={'coverage'}
          stats={stats} 
          charts={['coverage']}
        />
      </Card>        
    </div>
  );
}