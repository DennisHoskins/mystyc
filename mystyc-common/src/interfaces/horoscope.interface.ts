import { AstrologyCalculated } from './astrology.interface';
import { ZodiacSignType } from '../schemas';
import { DailyAstronomicalEvents, MonthlyAstronomicalSummary } from './astronomical-events.interface';

export interface Horoscope {
  _id?: string;
  userId: string;   
  date: Date;
  time: string;
  timezone?: string;
  coordinates: { lat: number; lng: number };
  personalChart: AstrologyCalculated;
  cosmicChart: AstrologyCalculated;
  astronomicalEvents: DailyAstronomicalEvents;  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HoroscopeRequest {
  date: string; // "2025-03-15"
  time?: string; // "14:30"
  timezone?: string; // "America/New_York" 
  lat?: number;
  lng?: number;
}

export interface TimezoneCoordinates {
  timezone: string;
  lat: number;
  lng: number;
}

export interface CosmicEnergyParams {
  date: Date;
  time: string;
  timezone: string;
  coordinates: { lat: number; lng: number };
}

export interface ChartComparisonResult {
  personalChart: AstrologyCalculated;
  cosmicChart: AstrologyCalculated;
  comparisonMetrics?: {
    overallHarmony: number;
    strongestInfluence: string;
    challengingAspects: string[];
  };
}

export interface PlanetaryDayData {
  sign: ZodiacSignType;
  cosmicScore: number; // -1 to 1, how this cosmic planet harmonizes with other cosmic planets that day
  personalScore: number; // -1 to 1, how this cosmic planet interacts with user's birth chart
  interactions: {
    sun?: number;
    moon?: number; 
    rising?: number;
    venus?: number;
    mars?: number;
  };
}

export interface DailyEnergy {
  date: string; // "2025-01-13"  
  cosmicTotalScore: number; // -1 to 1
  personalTotalScore: number; // -1 to 1
  planets: {
    sun: PlanetaryDayData;
    moon: PlanetaryDayData;
    rising: PlanetaryDayData;
    venus: PlanetaryDayData;
    mars: PlanetaryDayData;
  };
}

export interface DailyEnergyRangeResponse {
  startDate: string; // "2025-01-13"
  endDate: string; // "2025-01-19"
  days: DailyEnergy[]; // Array of N days (7 for week, 30 for month, etc)
  cosmicScoreTotal: number; // Average cosmic score across all days
  personalScoreTotal: number; // Average personal score across all days
  monthlyAstronomicalSummary: MonthlyAstronomicalSummary;  
}