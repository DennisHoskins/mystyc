import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import { formatDateRangeForComponent } from '@/util/dateTime'
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';
import SimpleLineChart from '@/components/admin/ui/charts/SimpleLineChart';

type ChartType = 'stats' | 'delivery' | 'volume' | 'platforms';

interface NotificationsDashboardProps {
  query?: Partial<AdminStatsQuery> | null;
  stats?: NotificationStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function NotificationsDashboard({ 
  query,
  stats, 
  charts = ['stats', 'delivery', 'volume', 'platforms'],
  height
}: NotificationsDashboardProps) {
  const duration = formatDateRangeForComponent(query?.startDate, query?.endDate);

  // Transform delivery status for pie chart
  const deliveryData = [
    { name: 'Sent', value: stats?.delivery.deliveryMetrics.sent ?? 0, color: '#10b981' },
    { name: 'Failed', value: stats?.delivery.deliveryMetrics.failed ?? 0, color: '#ef4444' },
    { name: 'Pending', value: stats?.delivery.deliveryMetrics.pending ?? 0, color: '#f59e0b' }
  ];

  // Transform platform engagement for bar chart
  const platformData = stats?.engagement.deliveryByPlatform.map(platform => ({
    name: platform.platform,
    successRate: platform.successRate,
    sent: platform.sent
  }));

  // Transform recent volume trends
  const volumeData = stats?.pattern.volumeTrends;

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats ? stats.delivery.totalNotifications ?? 0 : "", label: 'Sent', color: 'text-blue-600' },
          { value: stats ? `${stats?.delivery.deliveryMetrics.successRate}%` : "", label: 'Success', color: 'text-green-600' }
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
        title={`Volume Trend (${duration})`}
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