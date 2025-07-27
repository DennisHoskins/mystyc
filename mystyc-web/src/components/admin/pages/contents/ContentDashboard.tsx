import { ContentStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsQuery } from 'mystyc-common/admin';
import { formatDateRangeForComponent } from '@/util/dateTime'
import KeyStatsGrid from '@/components/admin/ui/charts/KeyStatsGrid';
import SimpleLineChart from '@/components/admin/ui/charts/SimpleLineChart';
import SimpleBarChart from '@/components/admin/ui/charts/SimpleBarChart';
import PieChartWithLegend from '@/components/admin/ui/charts/PieChartWithLegend';

type ChartType = 'stats' | 'timeline' | 'performance' | 'coverage';

interface ContentDashboardProps {
  className?: string | null;
  query?: Partial<AdminStatsQuery> | null;
  stats?: ContentStats | null;
  charts?: ChartType[];
  height?: number;
}

export default function ContentDashboard({ 
  className,
  query,
  stats,
  charts = ['stats', 'timeline', 'performance', 'coverage'],
  height
}: ContentDashboardProps) {
  const duration = formatDateRangeForComponent(query?.startDate, query?.endDate);

  // Transform timeline data for line chart
  const timelineData = stats?.timeline.contentByPeriod.slice(-30).map(item => ({
    date: item.date.split('-').slice(1).join('/'), // MM/DD format
    content: item.hasContent ? 1 : 0
  }));

  // Transform generation time distribution for bar chart
  const performanceData = stats?.generation.generationTimeDistribution.map(item => ({
    range: item.range,
    count: item.count
  }));

  // Transform coverage data for pie chart
  const coverageData = [
    { 
      name: 'Days with Content', 
      value: stats?.timeline.contentByPeriod.filter(d => d.hasContent).length,
      color: '#10b981' 
    },
    { 
      name: 'Missing Days', 
      value: stats?.timeline.missingDates.length,
      color: '#ef4444' 
    }
  ];

  // Calculate coverage percentage
  const totalDays = stats?.timeline.contentByPeriod.length;
  const daysWithContent = stats?.timeline.contentByPeriod.filter(d => d.hasContent).length;
  const coveragePercentage = totalDays && daysWithContent && (totalDays > 0 ? Math.round((daysWithContent / totalDays) * 100) : 0);

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: (stats && stats.summary) ? (stats.summary.totalContent) : "", label: 'Total Content', color: 'text-blue-600' },
          { value: (stats && stats.summary) ? (`${stats.summary.successRate}%`) : "", label: 'Success Rate', color: 'text-green-600' }
        ]} 
      />
    ),
    timeline: (
      <SimpleLineChart 
        title={`Content Timeline (${duration})`}
        data={timelineData}
        height={height}
        dataKey="content"
        xAxisKey="date"
        color="#3b82f6"
        tooltipLabel="Content"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
      />
    ),
    performance: (
      <SimpleBarChart 
        title="Generation Speed"
        data={performanceData}
        height={height}
        dataKey="count"
        xAxisKey="range"
        color="#8b5cf6"
        tooltipLabel="Generations"
        fontSize={10}
      />
    ),
    coverage: (
      <PieChartWithLegend 
        title={`Coverage: ${coveragePercentage}%`}
        data={coverageData}
        height={height}
        showPercentage={false}
        colors={['#10b981', '#ef4444']}
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
};