import { Injectable } from '@nestjs/common';
import { logger } from '@/common/util/logger';
import timezoneCoordinates from './timezone-coordinates';

@Injectable()
export class TimezoneCoordsService {
  private timezoneCoords: Record<string, { lat: number; lng: number }>;

  constructor() {
    this.timezoneCoords = timezoneCoordinates;
    
    logger.info('Loaded timezone coordinates', { 
      count: Object.keys(this.timezoneCoords).length 
    }, 'TimezoneCoordsService');
  }

  getCoordinatesForTimezone(timezone: string): { lat: number; lng: number } {
    const coords = this.timezoneCoords[timezone];
    if (!coords) {
      logger.warn('Unknown timezone, using default coordinates', { 
        timezone, 
        defaultCoords: this.getDefaultCoordinates() 
      }, 'TimezoneCoordsService');
      
      return this.getDefaultCoordinates();
    }

    return coords;
  }

  private getDefaultCoordinates(): { lat: number; lng: number } {
    // Default to NYC coordinates
    return { lat: 40.7128, lng: -74.0060 };
  }

  isValidTimezone(timezone: string): boolean {
    return timezone in this.timezoneCoords;
  }
}