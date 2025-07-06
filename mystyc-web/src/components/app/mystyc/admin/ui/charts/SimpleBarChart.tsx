'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface BarDataItem {
  [key: string]: string | number;
}

interface SimpleBarChartProps {
  title: string;
  data: BarDataItem[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number;
  tooltipLabel?: string;
  showYAxis?: boolean;
  fontSize?: number;
}

export default function SimpleBarChart({ 
  title, 
  data, 
  dataKey, 
  xAxisKey,
  color = '#3b82f6',
  height,
  tooltipLabel,
  showYAxis = false,
  fontSize = 12
}: SimpleBarChartProps) {
  return (
    <div className='flex flex-col flex-1'>
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height={height} className="bg-gray-50 pt-4 rounded-md grow">
        <BarChart data={data}>
          <XAxis 
            dataKey={xAxisKey} 
            tick={{ fontSize }} 
            {...(!showYAxis && { axisLine: false })}
          />
          {showYAxis && <YAxis />}
          {!showYAxis && <YAxis hide />}
          <Tooltip 
            formatter={(value) => [value, tooltipLabel || dataKey]}
            {...(tooltipLabel && { labelFormatter: (value) => `${xAxisKey}: ${value}` })}
          />
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={[2, 2, 0, 0]} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}