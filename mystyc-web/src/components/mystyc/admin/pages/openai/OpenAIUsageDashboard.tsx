'use client';

import { StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { formatDateRangeForComponent } from '@/util/dateTime';
import { OpenAIUsageStats } from '@/interfaces';

import KeyStatsGrid from '@/components/mystyc/admin/ui/charts/KeyStatsGrid';
import SimpleLineChart from '@/components/mystyc/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/mystyc/admin/ui/charts/SimpleBarChart';
import PieChartWithLegend from '@/components/mystyc/admin/ui/charts/PieChartWithLegend';
import BudgetProgressCard from './BudgetProgressCard';


type ChartType = 'stats' | 'budget' | 'trends' | 'content-types' | 'performance';

interface OpenAIDashboardProps {
  className?: string | null;
  stats?: StatsResponseWithQuery<OpenAIUsageStats> | null;
  charts?: ChartType[];
  height?: number;
}

export default function OpenAIDashboard({ 
  className,
  stats,
  charts = ['stats', 'budget', 'trends', 'content-types', 'performance'],
  height = 100
}: OpenAIDashboardProps) {
  if (!stats) {
    return null;
  }

  const duration = formatDateRangeForComponent(stats.query?.startDate, stats.query?.endDate);

  // Transform monthly trends for line chart
  const costTrendsData = stats.data.monthlyUsage.monthlyUsage.map(item => ({
    month: item.month.split('-').slice(1).join('/'), // MM/YY format
    cost: item.cost,
    tokens: item.totalTokens
  }));

  // Transform content type usage for pie chart
  const contentTypeData = stats.data.contentTypeUsage.usageByContentType.map(item => ({
    name: item.contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.requests,
    percentage: item.costPercentage
  }));

  // Transform performance data for bar chart
  const performanceData = stats.data.contentTypeUsage.usageByContentType.map(item => ({
    type: item.contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    avgTime: item.averageGenerationTime,
    retries: item.retries
  }));

  // Calculate budget usage percentage for both cost and tokens
  // const costUsagePercent = Math.round((stats.data.currentMonthlyUsage.costUsed / stats.data.currentMonthlyUsage.costBudget) * 100);
  // const tokenUsagePercent = Math.round((stats.data.currentMonthlyUsage.tokensUsed / stats.data.currentMonthlyUsage.tokenBudget) * 100);

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats.data.usageSummary.totalRequests, label: 'Total Requests', color: 'text-blue-600' },
          { value: `$${stats.data.currentMonthlyUsage.costUsed.toFixed(4)}`, label: 'Cost Used', color: 'text-green-600' }
        ]} 
      />
    ),
    budget: (
      <BudgetProgressCard
        costUsed={stats.data.currentMonthlyUsage.costUsed}
        costBudget={stats.data.currentMonthlyUsage.costBudget}
        tokensUsed={stats.data.currentMonthlyUsage.tokensUsed}
        tokenBudget={stats.data.currentMonthlyUsage.tokenBudget}
      />
    ),
    trends: (
      <SimpleLineChart 
        title={`Usage Trends (${duration})`}
        data={costTrendsData}
        height={height}
        dataKey="cost"
        xAxisKey="month"
        color="#3b82f6"
        tooltipLabel="Cost ($)"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
      />
    ),
    'content-types': (
      <PieChartWithLegend 
        title="Usage by Content Type"
        data={contentTypeData}
        height={height}
        showPercentage={true}
      />
    ),
    performance: (
      <SimpleBarChart 
        title="Avg Generation Time"
        data={performanceData}
        height={height}
        dataKey="avgTime"
        xAxisKey="type"
        color="#8b5cf6"
        tooltipLabel="Milliseconds"
        fontSize={10}
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