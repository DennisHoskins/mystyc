'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface PieDataItem {
  name: string;
  value: number | undefined;
  percentage?: number;
  color?: string;
}

interface PieChartWithLegendProps {
  title: string;
  label?: boolean;
  data?: PieDataItem[] | undefined | null;
  colors?: string[];
  showPercentage?: boolean;
  height?: number | string;
}

const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function PieChartWithLegend({ 
  title, 
  label = true,
  data = [], 
  colors = DEFAULT_COLORS, 
  showPercentage = true,
  height = '100%'
}: PieChartWithLegendProps) {
  return (
    <div className='flex flex-col flex-1 bg-gray-50 py-2 rounded-md'>
      {label && <h4 className="text-sm font-medium text-gray-700 ml-4 mb-2">{title}</h4>}
      <div className="flex items-center justify-between grow">
        {data &&
          <ResponsiveContainer width="50%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={40}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => 
                  showPercentage && props.payload.percentage
                    ? [`${props.payload.percentage}%`, props.payload.name]
                    : [value, name]
                } 
              />
            </PieChart>
          </ResponsiveContainer>
        }
        <div className="text-xs space-y-1 pr-4">
          {data && data.map((item, index) => (
            <div key={item.name} className="flex items-center">
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className='text-[10px]'>
                {item.name}: {showPercentage && item.percentage ? `${item.percentage}%` : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}