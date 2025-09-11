import React from 'react';
import { MonthlyAstronomicalSummary } from 'mystyc-common';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';
import MoonPhaseIcon from '@/components/mystyc/ui/MoonPhaseIcon';
import { Star } from 'lucide-react';

interface CalendarProps {
  date: Date;
  summary: MonthlyAstronomicalSummary;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  dayNumber: number;
}

const Calendar: React.FC<CalendarProps> = ({ date, summary }) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
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
    summary.moonPhases?.forEach(phase => {
      const existing = eventMap.get(phase.date) || {};
      eventMap.set(phase.date, { ...existing, moonPhase: phase });
    });
    
    // Add other events
    summary.events?.forEach(event => {
      const existing = eventMap.get(event.date!) || {};
      eventMap.set(event.date!, { ...existing, event });
    });
    
    return eventMap;
  };

  // Calculate moon phase for any given date
  const getMoonPhaseForDate = (targetDate: Date, summary: MonthlyAstronomicalSummary) => {
    //const dateString = targetDate.toISOString().split('T')[0];
    const sortedPhases = summary.moonPhases?.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ) || [];
    
    if (sortedPhases.length === 0) return { phase: 'New Moon' as const, percent: 0 };
    
    // Map phase names to their position in the 0-1 cycle
    const getPhaseValue = (phaseName: string): number => {
      switch (phaseName) {
        case 'New Moon': return 0;
        case 'First Quarter': return 0.25;
        case 'Full Moon': return 0.5;
        case 'Last Quarter': return 0.75;
        default: return 0;
      }
    };
    
    // Find the two phases this date falls between
    let beforePhase = sortedPhases[sortedPhases.length - 1]; // Default to last phase of cycle
    let afterPhase = sortedPhases[0];
    
    for (let i = 0; i < sortedPhases.length; i++) {
      const phaseDate = new Date(sortedPhases[i].date);
      if (targetDate >= phaseDate) {
        beforePhase = sortedPhases[i];
        afterPhase = sortedPhases[(i + 1) % sortedPhases.length];
      } else {
        break;
      }
    }
    
    const beforeDate = new Date(beforePhase.date);
    const afterDate = new Date(afterPhase.date);
    
    // Handle month wrapping
    if (afterDate <= beforeDate) {
      afterDate.setMonth(afterDate.getMonth() + 1);
    }
    
    const totalDays = (afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24);
    const daysPassed = (targetDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24);
    const progressPercent = totalDays > 0 ? Math.max(0, Math.min(1, daysPassed / totalDays)) : 0;
    
    const beforeValue = getPhaseValue(beforePhase.phase);
    const afterValue = getPhaseValue(afterPhase.phase);
    
    // Handle cycle wrapping (e.g., Last Quarter 0.75 -> New Moon 0)
    let phaseProgress;
    if (afterValue < beforeValue) {
      phaseProgress = beforeValue + progressPercent * ((1 - beforeValue) + afterValue);
      if (phaseProgress >= 1) phaseProgress -= 1;
    } else {
      phaseProgress = beforeValue + progressPercent * (afterValue - beforeValue);
    }
    
    // Convert back to phase name and percent for the component
    let phaseName: 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter';
    let phasePercent: number;
    
    if (phaseProgress < 0.125) {
      phaseName = 'New Moon';
      phasePercent = phaseProgress * 8; // 0-1 within this phase
    } else if (phaseProgress < 0.375) {
      phaseName = 'First Quarter';
      phasePercent = (phaseProgress - 0.125) * 4; // 0-1 within this phase
    } else if (phaseProgress < 0.625) {
      phaseName = 'Full Moon';
      phasePercent = (phaseProgress - 0.375) * 4; // 0-1 within this phase
    } else if (phaseProgress < 0.875) {
      phaseName = 'Last Quarter';
      phasePercent = (phaseProgress - 0.625) * 4; // 0-1 within this phase
    } else {
      phaseName = 'New Moon';
      phasePercent = (phaseProgress - 0.875) * 8; // 0-1 within this phase
    }
    
    return {
      phase: phaseName,
      percent: phasePercent
    };
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
            <Text variant="small" className="text-gray-400 font-medium">
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
          
          return (
            <Panel 
              key={index} 
              className="!p-0 !rounded-none aspect-square flex flex-col items-center justify-center min-h-[60px]"
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