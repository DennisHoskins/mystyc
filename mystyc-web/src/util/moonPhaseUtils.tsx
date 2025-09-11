import { MonthlyAstronomicalSummary } from 'mystyc-common';

export interface MoonPhaseResult {
  phase: 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter';
  percent: number;
}

export const getMoonPhaseForDate = (
  date: string | Date, 
  summary: MonthlyAstronomicalSummary
): MoonPhaseResult => {
  const currentDate = typeof date === 'string' ? new Date(date) : date;
  
  const sortedPhases = summary.moonPhases?.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ) || [];
  
  if (sortedPhases.length === 0) {
    return { phase: 'New Moon', percent: 0 };
  }
  
  // Find the most recent phase before or on the current date
  let currentPhase = sortedPhases[0];
  let nextPhase = sortedPhases[1] || sortedPhases[0];
  
  for (let i = 0; i < sortedPhases.length - 1; i++) {
    const phaseDate = new Date(sortedPhases[i].date);
    const nextPhaseDate = new Date(sortedPhases[i + 1].date);
    
    if (currentDate >= phaseDate && currentDate < nextPhaseDate) {
      currentPhase = sortedPhases[i];
      nextPhase = sortedPhases[i + 1];
      break;
    }
  }
  
  // Calculate simple progress between phases
  const currentPhaseDate = new Date(currentPhase.date);
  const nextPhaseDate = new Date(nextPhase.date);
  const totalDays = (nextPhaseDate.getTime() - currentPhaseDate.getTime()) / (1000 * 60 * 60 * 24);
  const daysPassed = (currentDate.getTime() - currentPhaseDate.getTime()) / (1000 * 60 * 60 * 24);
  const progress = totalDays > 0 ? Math.max(0, Math.min(1, daysPassed / totalDays)) : 0;
  
  return {
    phase: currentPhase.phase as 'New Moon' | 'First Quarter' | 'Full Moon' | 'Last Quarter',
    percent: progress
  };
};

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