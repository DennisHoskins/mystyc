'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import Panel from '@/components/ui/Panel';

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
    <Panel padding={4} className='flex-1 min-h-40 !p-4'>
      {label && <h4 className="text-sm font-bold text-gray-500 ml-2 mb-4">{title}</h4>}
      {data && (
        <ResponsiveContainer minWidth={10} minHeight={10} width="100%" height={height} className="grow min-h-1">
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
    </Panel>
  );
}