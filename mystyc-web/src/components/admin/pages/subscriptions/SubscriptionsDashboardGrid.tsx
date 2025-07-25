'use client';

import { SubscriptionStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import Card from "@/components/ui/Card";
import SubscriptionsDashboard from "./SubscriptionsDashboard";

export default function SubscriptionsDashboardGrid({
  stats
} : {
  stats: AdminStatsResponseWithQuery<SubscriptionStats> | null
}) {
  return (
    <div className='flex-1 grid grid-cols-3 gap-4 h-[15em] mb-4'>
      <Card className='col-span-2 flex-1 flex'>
        <SubscriptionsDashboard
          key={'mrr'}
          stats={stats} 
          charts={['mrr']}
        />
      </Card>
      <Card>
        <SubscriptionsDashboard 
          key={'tiers'}
          stats={stats} 
          charts={['tiers']}
        />
      </Card>        
    </div>
  );
}