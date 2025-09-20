'use client'

import { LineChart, Line, XAxis, ResponsiveContainer } from 'recharts';
import { DailyEnergyRangeResponse } from 'mystyc-common';

interface WeeklyEnergyChartProps {
  data: DailyEnergyRangeResponse | null;
  date: Date | null;
  style?: object;
}

interface ChartDataPoint {
  date: string;
  day: string; // "Mon", "Tue", etc.
  cosmic: number;
  personal: number;
  isToday: boolean;
}

export default function WeeklyEnergyChart({ data, date,  style }: WeeklyEnergyChartProps) {
  if (!date) {
    return;
  }

  // Get today's date string for comparison
  const today = date.getFullYear() + '-' + 
    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
    String(date.getDate()).padStart(2, '0');

  // Transform data for recharts
  const chartData: ChartDataPoint[] = data ? data.days.map((day) => {
    // Parse date manually to avoid timezone issues
    const [year, month, dayNum] = day.date.split('-').map(Number);
    const date = new Date(year, month - 1, dayNum); // month is 0-indexed
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      date: day.date,
      day: dayName,
      cosmic: Math.round(day.cosmicTotalScore * 100) / 100,
      personal: Math.round(day.personalTotalScore * 100) / 100,
      isToday: day.date === today
    };
  }) : [];

  // Custom dot for cosmic line
  const CosmicDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isToday) {
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#380a57"
            stroke="#380a57"
            strokeWidth={2}
          />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill="#380a57" strokeWidth={2} />;
  };

  // Custom dot for personal line  
  const PersonalDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isToday) {
      return (
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill="#10B981"
            stroke="#047857"
            strokeWidth={2}
          />
        </g>
      );
    }
    return <circle cx={cx} cy={cy} r={3} fill="#10B981" strokeWidth={2} />;
  };

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          style={style}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <XAxis 
            dataKey="day" 
            stroke="#666"
            fontSize={12}
          />
          <Line
            type="monotone"
            dataKey="cosmic"
            stroke="#380a57"
            strokeWidth={2}
            dot={<CosmicDot />}
            activeDot={{ r: 6, stroke: '#380a57', strokeWidth: 2 }}
            name="Cosmic Energy"
          />
          <Line
            type="monotone"
            dataKey="personal"
            stroke="#10B981"
            strokeWidth={3}
            dot={<PersonalDot />}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            name="Personal Energy"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}