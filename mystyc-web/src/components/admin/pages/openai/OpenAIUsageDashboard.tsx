import { OpenAIUsageStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin/';
import { formatDateRangeForComponent } from '@/util/dateTime';
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import SimpleLineChart from '@/components/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';
import BudgetProgressPanel from './BudgetProgressPanel';

type ChartType = 'stats' | 'budget' | 'trends' | 'content-types' | 'performance';

interface OpenAIDashboardProps {
  className?: string | null;
  query?: Partial<AdminStatsQuery> | null;
  stats?: OpenAIUsageStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function OpenAIDashboard({ 
  className,
  query,
  stats,
  charts = ['stats', 'budget', 'trends', 'content-types', 'performance'],
  height
}: OpenAIDashboardProps) {
  const duration = formatDateRangeForComponent(query?.startDate, query?.endDate);

  // Transform monthly trends for line chart
  const costTrendsData = stats?.monthlyUsage.monthlyUsage.map(item => ({
    month: item.month.split('-').slice(1).join('/'), // MM/YY format
    cost: item.cost,
    tokens: item.totalTokens
  }));

  // Transform content type usage for pie chart
  const contentTypeData = stats?.contentTypeUsage.usageByContentType.map(item => ({
    name: item.contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: item.costPercentage,
    percentage: item.costPercentage
  }));

  // Transform performance data for bar chart
  const performanceData = stats?.contentTypeUsage.usageByContentType.map(item => ({
    type: item.contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    avgTime: item.averageGenerationTime,
    retries: item.retries
  }));

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats?.usageSummary.totalRequests ?? "", label: 'Requests', color: 'text-blue-600' },
          { value: `${stats ? "$" + stats.currentMonthlyUsage.costUsed.toFixed(3) : ""}`, label: 'Used', color: 'text-green-600' }
        ]} 
      />
    ),
    budget: (
      <BudgetProgressPanel
        costUsed={stats?.currentMonthlyUsage.costUsed}
        costBudget={stats?.currentMonthlyUsage.costBudget}
        tokensUsed={stats?.currentMonthlyUsage.tokensUsed}
        tokenBudget={stats?.currentMonthlyUsage.tokenBudget}
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