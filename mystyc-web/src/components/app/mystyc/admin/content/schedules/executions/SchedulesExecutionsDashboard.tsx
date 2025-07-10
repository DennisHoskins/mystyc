'use client';

import { CalendarFold } from 'lucide-react';

import { StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { ScheduleExecutionStats } from '@/interfaces/admin/stats/adminScheduleExecutionStats.interface';

import KeyStatsGrid from '@/components/app/mystyc/admin/ui/charts/KeyStatsGrid';
import PieChartWithLegend from '@/components/app/mystyc/admin/ui/charts/PieChartWithLegend';
import SimpleBarChart from '@/components/app/mystyc/admin/ui/charts/SimpleBarChart';
import SimpleLineChart from '@/components/app/mystyc/admin/ui/charts/SimpleLineChart';

type ChartType = 'stats' | 'timeline' | 'breakdown' | 'recent' | 'performance' | 'today';

interface SchedulesExecutionsDashboardProps {
  stats?: StatsResponseWithQuery<ScheduleExecutionStats> | null;
  charts?: ChartType[];
  height?: number;
}

export default function SchedulesExecutionsDashboard({ 
  stats, 
  charts = ['stats', 'timeline', 'breakdown', 'recent', 'performance', 'today'],
  height = 100
}: SchedulesExecutionsDashboardProps) {
  if (!stats) {
    return null;
  }

  // Transform execution timeline data for line chart
  const timelineData = stats.data.recentExecutions.slice(-10).reverse().map((execution, index) => ({
    date: new Date(execution.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    executions: execution.status === 'completed' ? 1 : 0,
    index: index
  }));

  // Transform event type breakdown for pie chart
  const breakdownData = stats.data.byEventType.map(event => ({
    name: event.eventName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || event.eventName,
    value: event.executions,
    percentage: Math.round((event.executions / stats.data.overall.totalExecutions) * 100)
  }));

  // Transform event type performance for bar chart
  const performanceData = stats.data.byEventType.map(event => ({
    name: event.eventName.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim() || event.eventName,
    successRate: event.successRate,
    executions: event.executions
  }));

  // Transform recent executions for simple visualization
  const recentData = stats.data.recentExecutions.slice(0, 7).map((execution, index) => ({
    event: execution.eventName.split('.').pop() || execution.eventName,
    success: execution.status === 'completed' ? 1 : 0,
    index: index + 1
  }));

  const chartComponents = {
    stats: (
      <KeyStatsGrid 
        stats={[
          { value: stats.data.overall.totalExecutions, label: 'Total Executions', color: 'text-blue-600' },
          { value: `${stats.data.overall.successRate}%`, label: 'Success Rate', color: 'text-green-600' }
        ]} 
      />
    ),
    timeline: (
      <SimpleLineChart 
        title="Recent Execution Trend"
        data={timelineData}
        height={height}
        dataKey="executions"
        xAxisKey="date"
        color="#3b82f6"
        tooltipLabel="Successful Executions"
        showXAxisTicks={false}
        strokeWidth={2}
        showDots={true}
      />
    ),
    breakdown: (
      <PieChartWithLegend 
        title="Execution Distribution"
        data={breakdownData}
        height={height}
        showPercentage={true}
      />
    ),
    performance: (
      <SimpleBarChart 
        title="Success Rate by Event"
        data={performanceData}
        height={height}
        dataKey="successRate"
        xAxisKey="name"
        color="#10b981"
        tooltipLabel="Success Rate %"
        fontSize={10}
      />
    ),
    recent: (
      <SimpleBarChart 
        title="Recent Execution Status"
        data={recentData}
        height={height}
        dataKey="success"
        xAxisKey="event"
        color="#8b5cf6"
        tooltipLabel="Status"
        fontSize={10}
      />
    ),
    today: (
      <div className='flex-1 flex flex-col items-center justify-center rounded-md bg-gray-50 text-xs'>
        <div className={`inline-flex items-center w-full p-4 rounded-lg bg-gray-50 justify-center md:justify-start `}>
          <CalendarFold className="w-6 h-6 mr-4 text-gray-500" />
          <div>
            <span className='font-bold pb-1 inline-block'>
              Today:
            </span>
            <br />
            Executed: 2
            <br />
            Pending: 1
          </div>
        </div>
      </div>
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