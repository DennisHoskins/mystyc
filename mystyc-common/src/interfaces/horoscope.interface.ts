import { AstrologyCalculated } from './astrology.interface';

export interface Horoscope {
  _id?: string;
  userId: string;   
  date: Date;
  time: string;
  timezone?: string;
  coordinates: { lat: number; lng: number };
  personalChart: AstrologyCalculated;
  cosmicChart: AstrologyCalculated;
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