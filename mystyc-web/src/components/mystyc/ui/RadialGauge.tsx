import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface RadialGaugeProps {
  totalScore: number | null | undefined; // -1 to 1 scale
  size?: number;
  label: string;
  showPercentage?: boolean;
  inline?: boolean;
  className?: string;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({ 
  totalScore, 
  size = 120,
  label = 'Percent',
  showPercentage = true,
  inline = false,
  className
}) => {
  // Convert -1 to 1 scale to 0-100 percentage
  const percentage = (totalScore != null && totalScore !== undefined) ? Math.round(((totalScore + 1) / 2) * 100) : 0;
  
  // Determine color based on compatibility level
  const getColor = (percent: number) => {
    if (percent >= 70) return '#10b981'; // Green - high compatibility
    if (percent >= 50) return '#f59e0b'; // Amber - moderate compatibility  
    if (percent >= 30) return '#f97316'; // Orange - low compatibility
    return '#ef4444'; // Red - tension
  };

  const color = getColor(percentage);
  
  const data = [
    {
      name: 'Background',
      value: 100,
      fill: '#e5e7eb' // Light gray background
    },
    {
      name: label, 
      value: percentage,
      fill: color
    }
  ];

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div style={{ width: size, height: size }}>
        {(totalScore != null && totalScore != undefined) &&
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={180}
              endAngle={-180}
              data={data}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                stackId="stack"
              />
            </RadialBarChart>
          </ResponsiveContainer>
        }
      </div>
      
      {(showPercentage && totalScore != null) && (
        <div className="items-center w-full flex justify-center">
          <div
            className={`
              absolute inset-0 flex items-center justify-center text-xl font-bold
              md:${inline 
                ? 'absolute inset-0 flex items-center justify-center text-md font-bold' 
                : 'relative md:inset-auto md:text-2xl md:mt-4 font-bold block'
              }
            `}
            style={{ color }}
          >
            {percentage}%
          </div>

          {(!inline && label.length > 0) &&
            <div className={`${inline ? 'text-xs' : 'text-sm'} text-gray-600 hidden md:block -mt-10`}>
              {label}
            </div>
          }

        </div>
      )}
    </div>
  );
};

export default RadialGauge;