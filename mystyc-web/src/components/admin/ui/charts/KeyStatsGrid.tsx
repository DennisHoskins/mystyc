'use client'

interface StatItem {
  value: string | number;
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
    <div className="@container flex grow h-full">
      <div className={`grow grid gap-4 grid-cols-1 @[200px]:grid-cols-2`}>
        {stats.map((stat, index) => (
          <div key={index} className="text-center bg-gray-100 py-2 rounded-md flex flex-col justify-center">
            <div className={`text-2xl h-8 font-bold ${stat.color || 'text-blue-600'}`}>
              {formatNumber(stat.value)}
            </div>
            <div className="text-[10px] text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>  
  );
}