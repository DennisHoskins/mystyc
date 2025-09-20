import { MonthlyAstronomicalSummary } from 'mystyc-common';

export interface MoonPhaseResult {
  phase: 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 
         'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';
  percent: number;
}

export const getMoonPhaseForExactDate = (
  date: string, 
  summary: MonthlyAstronomicalSummary
) => {
  return summary.moonPhases?.find(phase => phase.date === date);
};

export const getEventsForDate = (
  date: string, 
  summary: MonthlyAstronomicalSummary
) => {
  return summary.events?.filter(event => event.date === date) || [];
};

export const getMoonPhaseForDate = (targetDate: Date, summary: MonthlyAstronomicalSummary | null | undefined): MoonPhaseResult => {
  if (!summary) {
    return { phase: 'New Moon', percent: 0 };
  }
  const sortedPhases = summary.moonPhases?.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ) || [];
  
  if (sortedPhases.length === 0) return { phase: 'New Moon', percent: 0 };
  
  const dateString = targetDate.toISOString().split('T')[0];
  
  // Check for exact match - use percent: 0 for exact phase position
  const exactMatch = sortedPhases.find(phase => phase.date === dateString);
  if (exactMatch) {
    return { phase: exactMatch.phase as MoonPhaseResult['phase'], percent: 0 };
  }
  
  // Find the phase before this date
  let beforePhase = null;
  let afterPhase = null;
  
  for (let i = 0; i < sortedPhases.length; i++) {
    const phaseDate = new Date(sortedPhases[i].date);
    if (targetDate >= phaseDate) {
      beforePhase = sortedPhases[i];
    } else {
      afterPhase = sortedPhases[i];
      break;
    }
  }
  
  if (!beforePhase && afterPhase) {
    // Date is before first known phase - estimate previous phase in cycle
    const firstPhaseIndex = getPhaseIndex(afterPhase.phase);
    const estimatedPhaseIndex = firstPhaseIndex === 0 ? 7 : firstPhaseIndex - 1;
    const estimatedPhase = getAllPhaseNames()[estimatedPhaseIndex];
    return { phase: estimatedPhase, percent: 0.8 };
  }
  
  if (beforePhase && !afterPhase) {
    // Date is after last known phase - estimate next phase in cycle  
    const lastPhaseIndex = getPhaseIndex(beforePhase.phase);
    const estimatedPhaseIndex = (lastPhaseIndex + 1) % 8;
    const estimatedPhase = getAllPhaseNames()[estimatedPhaseIndex];
    return { phase: estimatedPhase, percent: 0.2 };
  }
  
  if (!beforePhase || !afterPhase) {
    return { phase: 'New Moon', percent: 0 };
  }
  
  // Calculate progress between the two phases
  const beforeDate = new Date(beforePhase.date);
  const afterDate = new Date(afterPhase.date);
  
  const totalDays = (afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed = (targetDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24);
  const progressPercent = totalDays > 0 ? Math.max(0, Math.min(1, daysPassed / totalDays)) : 0;
  
  return {
    phase: beforePhase.phase as MoonPhaseResult['phase'],
    percent: progressPercent
  };
};

// Helper functions for the calendar
const getAllPhaseNames = (): MoonPhaseResult['phase'][] => [
  'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'
];

const getPhaseIndex = (phaseName: string): number => {
  return getAllPhaseNames().indexOf(phaseName as MoonPhaseResult['phase']);
};