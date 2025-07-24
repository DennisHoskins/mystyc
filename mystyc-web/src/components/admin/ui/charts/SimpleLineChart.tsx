'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface LineDataItem {
  [key: string]: string | number;
}

interface SimpleLineChartProps {
  title: string;
  label?: boolean;
  data?: LineDataItem[] | null;
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number | string;
  tooltipLabel?: string;
  showXAxisTicks?: boolean;
  strokeWidth?: number;
  showDots?: boolean;
}

export default function SimpleLineChart({ 
  title, 
  label = true,
  data, 
  dataKey, 
  xAxisKey,
  color = '#3b82f6',
  height = "100%",
  tooltipLabel,
  showXAxisTicks = false,
  strokeWidth = 2,
  showDots = false
}: SimpleLineChartProps) {
  return (
    <div className='flex flex-col flex-1 bg-gray-50 rounded-md pb-4'>
      {label && <h4 className="text-sm font-medium text-gray-700 ml-4 mt-2 mb-2">{title}</h4>}
      {data && (
        <ResponsiveContainer width="100%" height={height} className="grow">
          <LineChart 
            margin={{ left: 20, right: 20 }}
            data={data}
          >
            <XAxis 
              dataKey={xAxisKey} 
              tick={showXAxisTicks ? {stroke: color, strokeWidth: 0.1, fontSize: 12 } : false}
              axisLine={{stroke: color}}
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
      )}
    </div>
  );
}