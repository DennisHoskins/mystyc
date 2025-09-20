'use client'

import Panel from '@/components/ui/Panel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LabelList } from 'recharts';

interface BarDataItem {
  [key: string]: string | number;
}

interface SimpleBarChartProps {
  title: string;
  label?: boolean;
  data?: BarDataItem[];
  dataKey: string;
  xAxisKey: string;
  color?: string;
  height?: number | string;
  layout?: string;
  tooltipLabel?: string;
  showYAxis?: boolean;
  fontSize?: number;
}

export default function SimpleBarChart({ 
  title, 
  label = true,
  data, 
  dataKey, 
  xAxisKey,
  color = '#3b82f6',
  height = '100%',
  layout = 'horizontal',
  tooltipLabel,
  showYAxis = false,
  fontSize = 8
}: SimpleBarChartProps) {
  return (
    <Panel padding={4} className='flex-1 pb-2 pr-2 min-h-40 !p-4'>
      {label && <h4 className="text-sm font-bold text-gray-500 ml-2 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height={height} className="grow">
        <BarChart 
          data={data} 
          layout={layout == 'horizontal' ? 'horizontal' : 'vertical'}
          margin={{ left: 10, right: 10 }}
        >
          <XAxis 
            type={layout == 'horizontal' ? 'category' : 'number'}
            dataKey={layout == 'horizontal' ? xAxisKey : undefined}
            tick={{ fontSize }} 
            {...(!showYAxis && { axisLine: false })}
          />

          <YAxis 
            type={layout == 'horizontal' ? 'number' : 'category'}
            dataKey={layout == 'horizontal' ? undefined : xAxisKey}
            tick={{ fontSize }}
            {...(layout === 'vertical' && { width: 80 })}
            {...(showYAxis ? {} : { hide: true })}
          />          
          <Tooltip 
            formatter={(value) => [value, tooltipLabel || dataKey]}
            {...(tooltipLabel && { labelFormatter: (value) => `${xAxisKey}: ${value}` })}
          />
          <Bar 
            dataKey={dataKey} 
            fill={color} 
            radius={layout == 'horizontal' ? [2, 2, 0, 0] : [0, 2, 2, 0]} 
          >
            {layout === 'vertical' && (
              <LabelList
                position="insideLeft"
                dataKey={xAxisKey}
                fill="white"
                fontSize={fontSize - 1}
                fontWeight="600"
              />
            )}
          </Bar>            
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}