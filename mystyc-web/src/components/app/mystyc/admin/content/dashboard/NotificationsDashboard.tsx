'use client';

import { NotificationStats } from '@/interfaces';

import KeyStatsGrid from '@/components/app/mystyc/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/app/mystyc/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/app/mystyc/admin/ui/charts/SimpleBarChart';
import SimpleLineChart from '@/components/app/mystyc/admin/ui/charts/SimpleLineChart';

type ChartType = 'stats' | 'delivery' | 'volume' | 'platforms';

interface NotificationsDashboardProps {
  data?: NotificationStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function NotificationsDashboard({ 
  data, 
  charts = ['stats', 'delivery', 'volume', 'platforms'],
  height = 100
}: NotificationsDashboardProps) {
  if (!data) {
    return null;
  }

  // Transform delivery status for pie chart
  const deliveryData = [
    { name: 'Sent', value: data.delivery.deliveryMetrics.sent, color: '#10b981' },
    { name: 'Failed', value: data.delivery.deliveryMetrics.failed, color: '#ef4444' },
    { name: 'Pending', value: data.delivery.deliveryMetrics.pending, color: '#f59e0b' }
  ];

  // Transform platform engagement for bar chart
  const platformData = data.engagement.deliveryByPlatform.map(platform => ({
    name: platform.platform,
    successRate: platform.successRate,
    sent: platform.sent
  }));

  // Transform recent volume trends (last 10 days)
  const volumeData = data.pattern.volumeTrends.slice(-10);

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: data.delivery.totalNotifications, label: 'Total Sent', color: 'text-blue-600' },
          { value: `${data.delivery.deliveryMetrics.successRate}%`, label: 'Success Rate', color: 'text-green-600' }
        ]} 
      />
    ),
    delivery: (
      <PieChartWithLegend 
        title="Delivery Status"
        data={deliveryData}
        height={height}
        showPercentage={false}
        colors={['#10b981', '#ef4444', '#f59e0b']}
      />
    ),
    volume: (
      <SimpleLineChart 
        title="Volume Trend (Last 10 Days)"
        data={volumeData}
        height={height}
        dataKey="count"
        xAxisKey="date"
        color="#ef4444"
        tooltipLabel="Notifications"
        showXAxisTicks={false}
      />
    ),
    platforms: (
      <SimpleBarChart 
        title="Platform Success Rate"
        data={platformData}
        height={height}
        dataKey="successRate"
        xAxisKey="name"
        color="#06b6d4"
        tooltipLabel="Success Rate"
        fontSize={10}
      />
    )
  };

  return (
    <div className="@container grow flex flex-col">
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