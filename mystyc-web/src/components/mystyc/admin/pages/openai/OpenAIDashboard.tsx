'use client';

import { OpenAIRequestStats } from '@/interfaces';

import { StatsResponseWithQuery } from '@/api/apiClientAdmin';

import KeyStatsGrid from '@/components/mystyc/admin/ui/charts/KeyStatsGrid';
// import SimpleLineChart from '@/components/mystyc/admin/ui/charts/SimpleLineChart';
// import SimpleBarChart from '@/components/mystyc/admin/ui/charts/SimpleBarChart';
// import PieChartWithLegend from '@/components/mystyc/admin/ui/charts/PieChartWithLegend';

type ChartType = 'stats' | 'requests' | 'performance' | 'cost';

interface OpenAIDashboardProps {
  className?: string | null;
  stats?: StatsResponseWithQuery<OpenAIRequestStats> | null;
  charts?: ChartType[];
  height?: number;
}

export default function OpenAIDashboard({ 
  className,
  stats,
  charts = ['stats', 'requests', 'performance', 'cost'],
  height
}: OpenAIDashboardProps) {
  if (!stats) {
    return null;
  }

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: 0, label: 'Total requests', color: 'text-blue-600' },
          { value: 0, label: 'Total Cost', color: 'text-green-600' }
        ]} 
      />
    ),
    requests: (
      <p>TODO</p>
    ),
    performance: (
      <p>TODO</p>
    ),
    cost: (
      <p>TODO</p>
    ),
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
};