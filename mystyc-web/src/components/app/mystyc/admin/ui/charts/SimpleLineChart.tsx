'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface LineDataItem {
  [key: string]: string | number;
}

interface SimpleLineChartProps {
  title: string;
  data: LineDataItem[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  tooltipLabel?: string;
  showXAxisTicks?: boolean;
  strokeWidth?: number;
  showDots?: boolean;
}

export default function SimpleLineChart({ 
  title, 
  data, 
  dataKey, 
  xAxisKey,
  color = '#3b82f6',
  height,
  tooltipLabel,
  showXAxisTicks = false,
  strokeWidth = 2,
  showDots = false
}: SimpleLineChartProps) {
  return (
    <div className='flex flex-col flex-1'>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height={height} className="bg-gray-50 pt-4 rounded-md grow">
        <LineChart data={data}>
          <XAxis 
            dataKey={xAxisKey} 
            tick={showXAxisTicks}
            axisLine={false}
          />
          <YAxis hide />
          <Tooltip
            labelFormatter={(value) => `${xAxisKey}: ${value}`}
            formatter={(value) => [value, tooltipLabel || dataKey]}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={strokeWidth}
            dot={showDots}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}