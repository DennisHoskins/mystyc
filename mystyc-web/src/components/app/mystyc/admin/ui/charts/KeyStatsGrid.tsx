'use client';

interface StatItem {
  value: string | number;
  label: string;
  color?: string;
}

interface KeyStatsGridProps {
  stats: StatItem[];
}

export default function KeyStatsGrid({ stats }: KeyStatsGridProps) {
  return (
    <div className="@container flex grow">
      <div className={`grow grid gap-4 grid-cols-1 @[150px]:grid-cols-2`}>
        {stats.map((stat, index) => (
          <div key={index} className="text-center bg-gray-50 py-2 rounded-md flex flex-col justify-center">
            <div className={`text-2xl font-bold ${stat.color || 'text-blue-600'}`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>  
  );
}