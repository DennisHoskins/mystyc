'use client';

import { StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { SubscriptionStats } from '@/interfaces';

import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';

type ChartType = 'stats';

interface SubscriptionsDashboardProps {
  className?: string | null;
  stats?: SubscriptionStats | null;
  charts?: ChartType[];
}

export default function SubscriptionsDashboard({ 
  className,
  stats,
  charts = ['stats'],
}: SubscriptionsDashboardProps) {
  if (!stats) {
    return null;
  }

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: `$${(stats.summary.totalAmount / 100).toFixed(2)}`, label: 'Total Revenue', color: 'text-green-600' },
          { value: stats.summary.totalSubscriptions, label: 'Subscriptions', color: 'text-blue-600' },
        ]} 
      />
    )
  };

  return (
    <div className={`@container grow flex flex-col ${className}`}>
      <div className={`flex-1 flex flex-col @lg:grid grid-cols-${charts.length} gap-4`}>
        {charts.map((chartType) => (
          <div key={chartType} className='flex h-full'>
            {chartComponents[chartType]}
          </div>
        ))}
      </div>
    </div>
  );
}