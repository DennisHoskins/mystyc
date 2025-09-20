export enum EclipseType {
  TOTAL = 'total',
  PARTIAL = 'partial', 
  ANNULAR = 'annular',
  PENUMBRAL = 'penumbral'
}

export enum EventType {
  MERCURY_RETROGRADE_START = 'mercury_retrograde_start',
  MERCURY_RETROGRADE_END = 'mercury_retrograde_end', 
  SOLAR_ECLIPSE = 'solar_eclipse',
  LUNAR_ECLIPSE = 'lunar_eclipse',
  SPRING_EQUINOX = 'spring_equinox',
  SUMMER_SOLSTICE = 'summer_solstice',
  AUTUMN_EQUINOX = 'autumn_equinox',
  WINTER_SOLSTICE = 'winter_solstice'
}

export interface MoonPhase {
  phase: 'New Moon' | 'Waxing Crescent' | 'First Quarter' | 'Waxing Gibbous' | 'Full Moon' | 'Waning Gibbous' | 'Last Quarter' | 'Waning Crescent';
  illumination: number; // 0-1
  nextNewMoon?: string; // ISO date
  nextFullMoon?: string; // ISO date
}

export interface AstronomicalEvent {
  type: EventType;
  name: string;
  date?: string; // ISO date for single-day events
  startDate?: string; // ISO date for period events
  endDate?: string; // ISO date for period events
  eclipseType?: EclipseType; // Only for eclipses
  visibility?: string; // e.g., "Visible in North America"
}

export interface DailyAstronomicalEvents {
  moonPhase: MoonPhase;
  todaysEvents: AstronomicalEvent[];
}

export interface MonthlyAstronomicalSummary {
  month: string; // "2025-09"
  moonPhases: Array<{
    phase: MoonPhase['phase'];
    date: string; // ISO date
  }>;
  events: AstronomicalEvent[];
}