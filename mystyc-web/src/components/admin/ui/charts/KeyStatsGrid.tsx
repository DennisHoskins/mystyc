'use client'

interface StatItem {
  value: string | number | React.ReactNode;
  label: string;
  color?: string;
}

interface KeyStatsGridProps {
  stats: StatItem[];
}

function formatNumber(value: string | number): string {
  // If it's already a string, return as-is
  if (typeof value === 'string') {
    return value;
  }
  
  // If it's a number under 1000, return as-is
  if (value < 1000) {
    return value.toString();
  }
  
  // Format numbers >= 1000 with K suffix
  const thousands = value / 1000;
  
  // If it's a whole number of thousands, show without decimal
  if (thousands % 1 === 0) {
    return `${thousands}K`;
  }
  
  // Otherwise, show one decimal place
  return `${thousands.toFixed(1)}K`;
}

export default function KeyStatsGrid({ stats }: KeyStatsGridProps) {
  return (
    <div className={`flex w-full space-x-4 justify-end`}>
      {stats.map((stat, index) => (
        <div key={index} className="text-center flex flex-col items-center">
          <div className={`text-sm h-4 font-bold ${stat.color || 'text-blue-600'}`}>
            {typeof stat.value === 'string' || typeof stat.value === 'number' 
              ? formatNumber(stat.value) 
              : stat.value
            }
          </div>
          <div className="text-[8px] text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}