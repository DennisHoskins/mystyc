import React from 'react';
import { MonthlyAstronomicalSummary } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import MoonPhaseIcon from '@/components/mystyc/ui/MoonPhaseIcon';
import { Star } from 'lucide-react';
import { getMoonPhaseForDate } from '@/util/moonPhaseUtils';

interface CalendarProps {
  date: Date | null;
  summary: MonthlyAstronomicalSummary | null | undefined;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  dayNumber: number;
}

const Calendar: React.FC<CalendarProps> = ({ date, summary }) => {
  const year = date?.getFullYear() || 0;
  const month = date?.getMonth() || 0;
  
  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Start from Sunday (0) of the week containing the first day
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Calculate the Sunday of the week containing the last day of the month
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay())); // End on Saturday
    
    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);
    
    // Generate days from start Sunday through end Saturday
    while (currentDate <= endDate) {
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        dayNumber: currentDate.getDate()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Preprocess events for quick lookup
  const preprocessEvents = () => {
    const eventMap = new Map<string, { moonPhase?: any; event?: any }>();
    
    // Add moon phases
    summary?.moonPhases?.forEach(phase => {
      const existing = eventMap.get(phase.date) || {};
      eventMap.set(phase.date, { ...existing, moonPhase: phase });
    });
    
    // Add other events
    summary?.events?.forEach(event => {
      const existing = eventMap.get(event.date!) || {};
      eventMap.set(event.date!, { ...existing, event });
    });
    
    return eventMap;
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const calendarDays = generateCalendarDays();
  const eventMap = preprocessEvents();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Header with day names */}
      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(dayName => (
          <div key={dayName} className="text-center">
            <Text variant="small" color='text-gray-400' className="font-medium">
              {dayName}
            </Text>
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 rounded-md overflow-hidden border border-[var(--color-border)]">
        {calendarDays.map((calendarDay, index) => {
          const dateKey = formatDateKey(calendarDay.date);
          const dayEvents = eventMap.get(dateKey);
          const hasOtherEvent = dayEvents?.event;
          const moonPhase = getMoonPhaseForDate(calendarDay.date, summary);

          const today = new Date();
          const isToday = calendarDay.date.toDateString() === today.toDateString();
          
          return (
            <Panel 
              key={index} 
              className={`!p-0 !rounded-none aspect-square flex flex-col items-center justify-center min-h-[60px] ${
                isToday ? 'border-1 border-gray-400' : ''
              }`}
            >
              <Text 
                variant="small" 
                className={`mb-1 ${
                  calendarDay.isCurrentMonth 
                    ? '!text-gray-500' 
                    : '!text-gray-700'
                }`}
              >
                {calendarDay.dayNumber}
              </Text>
              
              <div className="flex items-center justify-center">
                {hasOtherEvent ? (
                  <Star className="w-4 h-4 text-yellow-400" />
                ) : (
                  <MoonPhaseIcon
                    phase={moonPhase.phase}
                    percent={moonPhase.percent}
                    size={16}
                    color={calendarDay.isCurrentMonth ? "#CCCCCC" : "#6B7280"}
                  />
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;