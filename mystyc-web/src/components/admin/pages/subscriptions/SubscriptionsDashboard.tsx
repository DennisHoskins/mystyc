import { SubscriptionStats } from 'mystyc-common/admin/interfaces/stats';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import SimpleLineChart from '@/components/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';

type ChartType = 'stats' | 'revenue' | 'mrr' | 'growth' | 'tiers' | 'conversion' | 'payments' | 'churn' | 'newSubscriptions';

interface SubscriptionsDashboardProps {
  className?: string | null;
  stats?: SubscriptionStats | null;
  charts?: ChartType[];
  height?: number;
  duration?: string;
}

export default function SubscriptionsDashboard({ 
  className,
  stats,
  charts = ['stats'],
  height,
  duration
}: SubscriptionsDashboardProps) {
  // Transform monthly revenue for line chart
  const revenueData = stats?.revenue.monthlyRevenue.slice(-12).map(month => ({
    month: month.month.split('-')[1] + '/' + month.month.split('-')[0].slice(-2), // MM/YY format
    revenue: month.revenue,
    plusRevenue: month.plusRevenue,
    proRevenue: month.proRevenue
  }));

  // Transform MRR trend (using monthly revenue as proxy)
  const mrrData = stats?.revenue.monthlyRevenue.slice(-12).map(month => ({
    month: month.month.split('-')[1] + '/' + month.month.split('-')[0].slice(-2), // MM/YY format
    mrr: month.revenue // Assuming monthly revenue represents MRR
  }));

  // Transform growth data for line chart
  const growthData = stats?.revenue.monthlyRevenue.slice(-12).map((month, index, array) => {
    const prevMonth = array[index - 1];
    const growthRate = prevMonth ? 
      Math.round(((month.revenue - prevMonth.revenue) / prevMonth.revenue) * 100) : 0;
    
    return {
      month: month.month.split('-')[1] + '/' + month.month.split('-')[0].slice(-2),
      growth: growthRate,
      subscriptions: month.subscriptionCount
    };
  });

  // Transform tier data for pie chart
  const tierData = stats?.revenue.revenueByTier.map(tier => ({
    name: tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1),
    value: tier.totalRevenue,
    percentage: tier.percentage,
    subscriptions: tier.subscriptionCount
  }));

  // Transform conversion data for bar chart
  const conversionData = [
    { metric: 'User to Plus', rate: stats?.lifecycle.conversionRates.userToPlus ?? 0 },
    { metric: 'User to Pro', rate: stats?.lifecycle.conversionRates.userToPro ?? 0 },
    { metric: 'Plus to Pro', rate: stats?.lifecycle.conversionRates.plusToPro ?? 0 },
    { metric: 'Total Conv.', rate: stats?.lifecycle.conversionRates.totalConversionRate ?? 0 }
  ];

  // Transform payment health data for pie chart
  const paymentData = [
    { name: 'Successful', value: stats?.paymentHealth.paymentMetrics.successfulPayments ?? 0, color: '#10b981' },
    { name: 'Failed', value: stats?.paymentHealth.paymentMetrics.failedPayments ?? 0, color: '#ef4444' }
  ];

  // Transform churn data for bar chart
  const churnData = stats?.lifecycle.churnAnalysis.churnByTier.map(tier => ({
    tier: tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1),
    churnRate: tier.churnRate,
    cancellations: tier.cancellations
  }));

  // Transform new subscriptions for line chart
  const newSubsData = stats?.lifecycle.newSubscriptions.slice(-30).map(day => ({
    date: day.date.split('-').slice(1).join('/'), // MM/DD format
    total: day.total,
    plus: day.plus,
    pro: day.pro
  }));

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: `${stats ? "%" + stats.summary.currentMRR.toLocaleString() : ""}`, label: 'MRR', color: 'text-green-600' },
          { value: stats ? stats.summary.totalSubscriptions : "", label: 'Active', color: 'text-blue-600' }
        ]} 
      />
    ),
    revenue: (
      <SimpleLineChart 
        title={`Monthly Revenue${duration ? ` (${duration})` : ''}`}
        data={revenueData}
        height={height}
        dataKey="revenue"
        xAxisKey="month"
        color="#10b981"
        tooltipLabel="Revenue ($)"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
      />
    ),
    mrr: (
      <SimpleLineChart 
        title={`MRR Trend${duration ? ` (${duration})` : ''}`}
        data={mrrData}
        height={height}
        dataKey="mrr"
        xAxisKey="month"
        color="#059669"
        tooltipLabel="MRR ($)"
        showXAxisTicks={false}
        strokeWidth={3}
        showDots={true}
      />
    ),
    growth: (
      <SimpleLineChart 
        title={`Growth Rate${duration ? ` (${duration})` : ''}`}
        data={growthData}
        height={height}
        dataKey="growth"
        xAxisKey="month"
        color="#3b82f6"
        tooltipLabel="Growth (%)"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
      />
    ),
    tiers: (
      <PieChartWithLegend 
        title="Revenue by Tier"
        data={tierData}
        height={height}
        showPercentage={true}
        colors={['#8b5cf6', '#06b6d4']}
      />
    ),
    conversion: (
      <SimpleBarChart 
        title="Conversion Rates"
        data={conversionData}
        height={height}
        dataKey="rate"
        xAxisKey="metric"
        color="#f59e0b"
        tooltipLabel="Conversion %"
        fontSize={10}
      />
    ),
    payments: (
      <PieChartWithLegend 
        title={`Payment Success (${stats?.paymentHealth.paymentMetrics.successRate}%)`}
        data={paymentData}
        height={height}
        showPercentage={false}
        colors={['#10b981', '#ef4444']}
      />
    ),
    churn: (
      <SimpleBarChart 
        title="Churn by Tier"
        data={churnData}
        height={height}
        dataKey="churnRate"
        xAxisKey="tier"
        color="#ef4444"
        tooltipLabel="Churn Rate %"
      />
    ),
    newSubscriptions: (
      <SimpleLineChart 
        title={`New Subscriptions (Last 30 Days)`}
        data={newSubsData}
        height={height}
        dataKey="total"
        xAxisKey="date"
        color="#8b5cf6"
        tooltipLabel="New Subs"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
      />
    )
  };

  return (
    <div className={`@container grow flex flex-col ${className}`}>
      <div className={`flex-1 flex flex-col @lg:grid grid-cols-${charts.length} gap-4`}>
        {charts.map((chartType) => (
          <div key={chartType} className='flex h-full w-full'>
            {chartComponents[chartType]}
          </div>
        ))}
      </div>
    </div>
  );
}