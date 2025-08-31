import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface CompatibilityGaugeProps {
  totalScore: number; // -1 to 1 scale
  size?: number;
  showPercentage?: boolean;
}

const CompatibilityGauge: React.FC<CompatibilityGaugeProps> = ({ 
  totalScore, 
  size = 120,
  showPercentage = true 
}) => {
  // Convert -1 to 1 scale to 0-100 percentage
  const percentage = Math.round(((totalScore + 1) / 2) * 100);
  
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
      name: 'Compatibility', 
      value: percentage,
      fill: color
    }
  ];

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }}>
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
      </div>
      
      {showPercentage && (
        <div className="mt-2 text-center">
          <div className="text-2xl font-bold" style={{ color }}>
            {percentage}%
          </div>
          <div className="text-sm text-gray-600">
            Compatible
          </div>
        </div>
      )}
    </div>
  );
};

export default CompatibilityGauge;