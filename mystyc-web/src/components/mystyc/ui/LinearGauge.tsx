import React from 'react';

interface LinearGaugeProps {
  score: number | null | undefined; // -1 to 1 scale
  label?: string | null;
  height?: number;
  showPercentage?: boolean;
}

const LinearGauge: React.FC<LinearGaugeProps> = ({ 
  score, 
  label,
  height = 8,
  showPercentage = true 
}) => {
  // Convert -1 to 1 scale to 0-100 percentage
  const percentage = (score != null && score !== undefined) ? Math.round(((score + 1) / 2) * 100) : 0;
  
  // Determine color based on score level
  const getColor = (percent: number) => {
    if (percent >= 70) return '#10b981'; // Green - high
    if (percent >= 50) return '#f59e0b'; // Amber - moderate  
    if (percent >= 30) return '#f97316'; // Orange - low
    return '#ef4444'; // Red - tension
  };

  const color = getColor(percentage);
  
  return (
    <div className='flex flex-col w-full'>
      <span className="text-xs text-gray-600 min-w-0 flex-shrink-0 min-h-4">{label}</span>
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-2 flex-1">
          <div 
            className="bg-gray-200 rounded-full overflow-hidden flex-1"
            style={{ height }}
          >
            <div 
              className="h-full rounded-full transition-all duration-300 ease-in-out"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: color
              }}
            />
          </div>
          
          {showPercentage && (
            <span className="text-sm font-medium min-w-0 flex-shrink-0 h-4" style={{ color }}>
              {(score != null && score != undefined) && `${percentage}%`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinearGauge;