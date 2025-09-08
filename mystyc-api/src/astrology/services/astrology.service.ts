import { Injectable } from '@nestjs/common';
import { ZodiacSignType } from 'mystyc-common/schemas';
import { PlanetaryDegrees } from 'mystyc-common/interfaces';
import { PlanetType } from 'mystyc-common/schemas';
import { getLongitudeDetails } from 'mystyc-common/util/astrology-degrees';
import { logger } from '@/common/util/logger';
import * as fs from 'fs';

const swisseph = require('swisseph');

export interface CoreAstrology {
  sunSign: ZodiacSignType;
  moonSign: ZodiacSignType;
  risingSign: ZodiacSignType;
  venusSign?: ZodiacSignType;
  marsSign?: ZodiacSignType;
  sunPosition: PlanetaryDegrees;
  moonPosition: PlanetaryDegrees;
  risingPosition: PlanetaryDegrees;
  venusPosition?: PlanetaryDegrees;
  marsPosition?: PlanetaryDegrees;  
}

export interface WeeklyAstrology {
  sunSign: ZodiacSignType;
  moonSign: ZodiacSignType;
  risingSign: ZodiacSignType;
  sunPosition: PlanetaryDegrees;
  moonPosition: PlanetaryDegrees;
  risingPosition: PlanetaryDegrees;
}

@Injectable()
export class AstrologyService {
  constructor() {
    // Set ephemeris path - try multiple possible locations
    const possiblePaths = [
      __dirname + '/node_modules/swisseph/ephe',
      __dirname + '/../node_modules/swisseph/ephe',
      __dirname + '/../../node_modules/swisseph/ephe',
      process.cwd() + '/node_modules/swisseph/ephe'
    ];
    
    let ephePath = '';
    
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        ephePath = path;
        break;
      }
    }
    
    if (ephePath) {
      logger.debug('Setting Swiss Ephemeris path', { ephePath }, 'AstrologyService');
      swisseph.swe_set_ephe_path(ephePath);
    } else {
      logger.warn('No ephemeris files found, using built-in approximations', {}, 'AstrologyService');
      // Swiss Ephemeris will fall back to built-in Moshier ephemeris
    }
  }

  /**
   * Calculates all core astrological positions (Sun, Moon, Rising, Venus, Mars)
   * @param dateOfBirth - Birth date
   * @param timeOfBirth - Birth time in HH:mm format
   * @param timezoneName - IANA timezone string (e.g., 'America/Edmonton')
   * @param coordinates - Birth location coordinates
   * @param planets - List of planets to use in calculations
   * @returns Promise<CoreAstrology> - All 5 core astrological positions
   * @throws Error if calculation fails or data is invalid
   */
  async calculateCoreAstrology(
    dateOfBirth: Date,
    timeOfBirth: string,
    timezoneName: string,
    coordinates: { lat: number; lng: number },
    planets: PlanetType[] = ['Sun', 'Moon', 'Rising', 'Venus', 'Mars']
  ): Promise<CoreAstrology> {
    logger.debug('Calculating core astrology', {
      dateOfBirth: dateOfBirth.toISOString(),
      timeOfBirth,
      timezoneName,
      coordinates
    }, 'AstrologyService');

    try {
      // Validate inputs
      this.validateInputs(dateOfBirth, timeOfBirth, timezoneName, coordinates);

      // Calculate historical timezone offset for birth date
      const timezoneOffset = this.getHistoricalTimezoneOffset(dateOfBirth, timezoneName);
      logger.debug('Timezone offset calculated', { timezoneOffset }, 'AstrologyService');
      
      // Parse time of birth
      const [hours, minutes] = timeOfBirth.split(':').map(Number);
      
      // Create birth moment in UTC
      const birthMomentUTC = new Date(
        dateOfBirth.getFullYear(),
        dateOfBirth.getMonth(),
        dateOfBirth.getDate(),
        hours,
        minutes
      );
      
      logger.debug('Birth moment before timezone adjustment', { 
        birthMomentUTC: birthMomentUTC.toISOString() 
      }, 'AstrologyService');
      
      // Adjust for timezone offset
      birthMomentUTC.setHours(birthMomentUTC.getHours() - timezoneOffset);
      
      logger.debug('Birth moment after timezone adjustment', { 
        birthMomentUTC: birthMomentUTC.toISOString(),
        adjustedBy: -timezoneOffset + ' hours'
      }, 'AstrologyService');
      
      // Calculate Julian day
      const julianDay = await this.calculateJulianDay(birthMomentUTC);
      
      // Calculate positions conditionally based on requested planets
      const calculations: Array<Promise<number>> = [];
      const planetMap: { [key: string]: number } = {};

      // Always calculate required planets
      if (planets.includes('Sun')) {
        calculations.push(this.getPlanetPosition(julianDay, swisseph.SE_SUN));
        planetMap['Sun'] = calculations.length - 1;
      }
      if (planets.includes('Moon')) {
        calculations.push(this.getPlanetPosition(julianDay, swisseph.SE_MOON));
        planetMap['Moon'] = calculations.length - 1;
      }
      if (planets.includes('Rising')) {
        calculations.push(this.getRisingSign(julianDay, coordinates.lat, coordinates.lng));
        planetMap['Rising'] = calculations.length - 1;
      }
      if (planets.includes('Venus')) {
        calculations.push(this.getPlanetPosition(julianDay, swisseph.SE_VENUS));
        planetMap['Venus'] = calculations.length - 1;
      }
      if (planets.includes('Mars')) {
        calculations.push(this.getPlanetPosition(julianDay, swisseph.SE_MARS));
        planetMap['Mars'] = calculations.length - 1;
      }

      const results = await Promise.all(calculations);

      // Extract position details for calculated planets
      const coreAstrology: CoreAstrology = {
        sunSign: this.mapLongitudeToZodiacSign(results[planetMap['Sun']]),
        moonSign: this.mapLongitudeToZodiacSign(results[planetMap['Moon']]),
        risingSign: this.mapLongitudeToZodiacSign(results[planetMap['Rising']]),
        sunPosition: getLongitudeDetails(results[planetMap['Sun']]),
        moonPosition: getLongitudeDetails(results[planetMap['Moon']]),
        risingPosition: getLongitudeDetails(results[planetMap['Rising']])
      };

      // Add optional planets if calculated
      if (planets.includes('Venus')) {
        const venusLongitude = results[planetMap['Venus']];
        coreAstrology.venusSign = this.mapLongitudeToZodiacSign(venusLongitude);
        coreAstrology.venusPosition = getLongitudeDetails(venusLongitude);
      }

      if (planets.includes('Mars')) {
        const marsLongitude = results[planetMap['Mars']];
        coreAstrology.marsSign = this.mapLongitudeToZodiacSign(marsLongitude);
        coreAstrology.marsPosition = getLongitudeDetails(marsLongitude);
      }

      logger.debug('Core astrology calculated successfully', {
        coreAstrology,
        julianDay,
        timezoneOffset
      }, 'AstrologyService');
      
      return coreAstrology;
    } catch (error) {
      logger.error('Failed to calculate core astrology', {
        dateOfBirth: dateOfBirth.toISOString(),
        timeOfBirth,
        timezoneName,
        error
      }, 'AstrologyService');
      
      throw new Error(`Core astrology calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateInputs(
    dateOfBirth: Date,
    timeOfBirth: string,
    timezoneName: string,
    coordinates: { lat: number; lng: number }
  ): void {
    if (!dateOfBirth || isNaN(dateOfBirth.getTime())) {
      throw new Error('Invalid birth date');
    }
    
    if (!timeOfBirth || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeOfBirth)) {
      throw new Error('Invalid birth time format. Expected HH:mm');
    }
    
    if (!timezoneName || typeof timezoneName !== 'string') {
      throw new Error('Invalid timezone name');
    }
    
    if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      throw new Error('Invalid coordinates');
    }
    
    if (coordinates.lat < -90 || coordinates.lat > 90) {
      throw new Error('Invalid latitude');
    }
    
    if (coordinates.lng < -180 || coordinates.lng > 180) {
      throw new Error('Invalid longitude');
    }
  }

  private getHistoricalTimezoneOffset(date: Date, timezoneName: string): number {
    try {
      // Create a test date with the same year, month, day at noon
      const testDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
      
      // Get the timezone offset for this specific date
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezoneName,
        timeZoneName: 'longOffset'
      });
      
      const parts = formatter.formatToParts(testDate);
      const offsetPart = parts.find(part => part.type === 'timeZoneName');
      
      if (offsetPart) {
        // Parse offset like "GMT-07:00" or "GMT+05:30"
        const match = offsetPart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
        if (match) {
          const sign = match[1] === '+' ? 1 : -1;
          const hours = parseInt(match[2], 10);
          const minutes = parseInt(match[3], 10);
          return sign * (hours + minutes / 60);
        }
      }
      
      // Fallback method
      const localTime = new Date(testDate.toLocaleString('en-US', { timeZone: timezoneName }));
      const utcTime = new Date(testDate.toLocaleString('en-US', { timeZone: 'UTC' }));
      return (localTime.getTime() - utcTime.getTime()) / (1000 * 60 * 60);
    } catch (error) {
      throw new Error(`Failed to calculate timezone offset: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async calculateJulianDay(date: Date): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1; // Month is 0-indexed in JS, 1-indexed in Swiss Ephemeris
        const day = date.getUTCDate();
        const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
        
        logger.debug('Calculating Julian day', { 
          year, month, day, hour,
          utcDate: date.toISOString()
        }, 'AstrologyService');
        
        swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (julday: any) => {
          logger.debug('Julian day result', { julday, type: typeof julday }, 'AstrologyService');
          
          if (typeof julday !== 'number' || isNaN(julday)) {
            reject(new Error(`Invalid Julian day calculation: ${julday}`));
            return;
          }
          resolve(julday);
        });
      } catch (error) {
        reject(new Error(`Julian day calculation failed: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }

  private async getPlanetPosition(julianDay: number, planet: number): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        logger.debug('Calculating planet position', { julianDay, planet }, 'AstrologyService');
        
        // Use Moshier flag for built-in ephemeris
        const flag = swisseph.SEFLG_MOSEPH; 
        
        swisseph.swe_calc_ut(julianDay, planet, flag, (result: any) => {
          logger.debug('Swiss Ephemeris result', { result, type: typeof result, planet }, 'AstrologyService');
          
          if (!result) {
            reject(new Error('No result from Swiss Ephemeris'));
            return;
          }
          
          // Check if it's an error result
          if (result.error) {
            reject(new Error(`Swiss Ephemeris error: ${result.error}`));
            return;
          }
          
          // Check for different result formats
          let longitude;
          if (Array.isArray(result) && result.length > 0) {
            longitude = result[0]; // Standard array format
          } else if (result.longitude !== undefined) {
            longitude = result.longitude; // Object format
          } else if (result.xx && Array.isArray(result.xx) && result.xx.length > 0) {
            longitude = result.xx[0]; // Alternative object format
          } else {
            reject(new Error(`Unexpected result format: ${JSON.stringify(result)}`));
            return;
          }
          
          if (typeof longitude !== 'number' || isNaN(longitude)) {
            reject(new Error(`Invalid longitude value: ${longitude}`));
            return;
          }
          
          logger.debug('Planet longitude calculated', { longitude, planet }, 'AstrologyService');
          resolve(longitude);
        });
      } catch (error) {
        reject(new Error(`Planet position calculation failed: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }

  private async getRisingSign(julianDay: number, latitude: number, longitude: number): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        logger.debug('Calculating rising sign', { julianDay, latitude, longitude }, 'AstrologyService');
        
        // Use Placidus house system (most common)
        const houseSystem = 'P';
        
        swisseph.swe_houses(julianDay, latitude, longitude, houseSystem, (result: any) => {
          logger.debug('House calculation result', { result, type: typeof result }, 'AstrologyService');
          
          if (!result) {
            reject(new Error('No result from house calculation'));
            return;
          }
          
          // Check if it's an error result
          if (result.error) {
            reject(new Error(`House calculation error: ${result.error}`));
            return;
          }
          
          // Get the Ascendant (1st house cusp)
          let ascendant;
          if (Array.isArray(result) && result.length > 0) {
            ascendant = result[0]; // First house cusp = Ascendant
          } else if (result.house && Array.isArray(result.house) && result.house.length > 0) {
            ascendant = result.house[0];
          } else if (result.cusps && Array.isArray(result.cusps) && result.cusps.length > 0) {
            ascendant = result.cusps[0];
          } else {
            reject(new Error(`Unexpected house result format: ${JSON.stringify(result)}`));
            return;
          }
          
          if (typeof ascendant !== 'number' || isNaN(ascendant)) {
            reject(new Error(`Invalid ascendant value: ${ascendant}`));
            return;
          }
          
          logger.debug('Rising sign calculated', { ascendant }, 'AstrologyService');
          resolve(ascendant);
        });
      } catch (error) {
        reject(new Error(`Rising sign calculation failed: ${error instanceof Error ? error.message : String(error)}`));
      }
    });
  }

  private mapLongitudeToZodiacSign(longitude: number): ZodiacSignType {
    // Normalize longitude to 0-360 range
    const normalizedLongitude = ((longitude % 360) + 360) % 360;
    
    if (normalizedLongitude >= 0 && normalizedLongitude < 30) return 'Aries';
    if (normalizedLongitude >= 30 && normalizedLongitude < 60) return 'Taurus';
    if (normalizedLongitude >= 60 && normalizedLongitude < 90) return 'Gemini';
    if (normalizedLongitude >= 90 && normalizedLongitude < 120) return 'Cancer';
    if (normalizedLongitude >= 120 && normalizedLongitude < 150) return 'Leo';
    if (normalizedLongitude >= 150 && normalizedLongitude < 180) return 'Virgo';
    if (normalizedLongitude >= 180 && normalizedLongitude < 210) return 'Libra';
    if (normalizedLongitude >= 210 && normalizedLongitude < 240) return 'Scorpio';
    if (normalizedLongitude >= 240 && normalizedLongitude < 270) return 'Sagittarius';
    if (normalizedLongitude >= 270 && normalizedLongitude < 300) return 'Capricorn';
    if (normalizedLongitude >= 300 && normalizedLongitude < 330) return 'Aquarius';
    if (normalizedLongitude >= 330 && normalizedLongitude < 360) return 'Pisces';
    
    // This should never happen with proper normalization
    throw new Error(`Invalid longitude for zodiac mapping: ${longitude}`);
  }
}