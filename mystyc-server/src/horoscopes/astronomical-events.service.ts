import { Injectable } from '@nestjs/common';
import { logger } from '@/common/util/logger';
import { 
  MoonPhase, 
  AstronomicalEvent, 
  MonthlyAstronomicalSummary,
  DailyAstronomicalEvents,
  EventType,
  EclipseType 
} from 'mystyc-common/interfaces';

const swisseph = require('swisseph');

@Injectable()
export class AstronomicalEventsService {
  
  /**
   * Get astronomical events for a specific date
   */
  async getDailyAstronomicalEvents(
    date: Date,
    coordinates: { lat: number; lng: number },
    timezone: string
  ): Promise<DailyAstronomicalEvents> {
    logger.debug('Getting daily astronomical events', { 
      date: date.toISOString(), 
      coordinates,
      timezone
    }, 'AstronomicalEventsService');

    try {
      const [moonPhase, todaysEvents] = await Promise.all([
        this.calculateMoonPhase(date, timezone),
        this.getTodaysEvents(date, coordinates, timezone)
      ]);

      logger.debug('Daily astronomical events calculated', {
        moonPhase: moonPhase.phase,
        eventsCount: todaysEvents.length
      }, 'AstronomicalEventsService');

      return { moonPhase, todaysEvents };
    } catch (error) {
      logger.error('Failed to get daily astronomical events', {
        date: date.toISOString(),
        timezone,
        error
      }, 'AstronomicalEventsService');
      
      // Return default values on error
      return {
        moonPhase: { phase: 'New Moon', illumination: 0 },
        todaysEvents: []
      };
    }
  }

  /**
   * Get monthly astronomical summary
   */
  async getMonthlyAstronomicalSummary(
    date: Date,
    coordinates: { lat: number; lng: number },
    timezone: string
  ): Promise<MonthlyAstronomicalSummary> {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

    logger.debug('Getting monthly astronomical summary', { 
      year, 
      month: month + 1, 
      coordinates,
      timezone
    }, 'AstronomicalEventsService');

    try {
      const [moonPhases, events] = await Promise.all([
        this.getMonthlyMoonPhases(year, month, timezone),
        this.getMonthlyEvents(year, month, coordinates, timezone)
      ]);

      logger.debug('Monthly astronomical summary calculated', {
        month: monthStr,
        moonPhasesCount: moonPhases.length,
        eventsCount: events.length
      }, 'AstronomicalEventsService');

      return { month: monthStr, moonPhases, events };
    } catch (error) {
      logger.error('Failed to get monthly astronomical summary', {
        year,
        month: month + 1,
        timezone,
        error
      }, 'AstronomicalEventsService');
      
      // Return default values on error
      return {
        month: monthStr,
        moonPhases: [],
        events: []
      };
    }
  }

  /**
   * Calculate moon phase for a specific date
   */
  private async calculateMoonPhase(date: Date, timezone: string): Promise<MoonPhase> {
    const julianDay = await this.calculateJulianDay(date);
    
    // Get Sun and Moon positions
    const [sunLongitude, moonLongitude] = await Promise.all([
      this.getPlanetPosition(julianDay, swisseph.SE_SUN),
      this.getPlanetPosition(julianDay, swisseph.SE_MOON)
    ]);

    // Calculate phase angle (difference between Moon and Sun longitude)
    let phaseAngle = moonLongitude - sunLongitude;
    if (phaseAngle < 0) phaseAngle += 360;
    if (phaseAngle > 360) phaseAngle -= 360;

    // Calculate illumination (0 = new moon, 1 = full moon)
    const illumination = (1 - Math.cos((phaseAngle * Math.PI) / 180)) / 2;

    // Determine phase name
    const phase = this.getPhaseNameFromAngle(phaseAngle);

    // Find next new and full moons (in user's timezone)
    const [nextNewMoon, nextFullMoon] = await Promise.all([
      this.findNextMoonPhase(date, 'new', timezone),
      this.findNextMoonPhase(date, 'full', timezone)
    ]);

    return {
      phase,
      illumination: Math.round(illumination * 1000) / 1000,
      nextNewMoon: nextNewMoon?.toLocaleDateString('en-CA', { timeZone: timezone }),
      nextFullMoon: nextFullMoon?.toLocaleDateString('en-CA', { timeZone: timezone })
    };
  }

  /**
   * Get today's specific events
   */
  private async getTodaysEvents(
    date: Date, 
    coordinates: { lat: number; lng: number },
    timezone: string
  ): Promise<AstronomicalEvent[]> {
    const events: AstronomicalEvent[] = [];

    // Check for eclipses today
    const eclipses = await this.checkForEclipsesToday(date, coordinates, timezone);
    events.push(...eclipses);

    // Check for mercury retrograde start/end
    const mercuryEvents = await this.checkForMercuryEventsToday(date, timezone);
    events.push(...mercuryEvents);

    // Check for solstices/equinoxes
    const seasonalEvents = await this.checkForSeasonalEventsToday(date, timezone);
    events.push(...seasonalEvents);

    return events;
  }

  /**
   * Get all moon phases for a month
   */
  private async getMonthlyMoonPhases(year: number, month: number, timezone: string): Promise<Array<{
    phase: MoonPhase['phase'];
    date: string;
  }>> {
    const phases: Array<{ phase: MoonPhase['phase']; date: string }> = [];
    
    // Start from beginning of month IN USER'S TIMEZONE
    const startDate = new Date(new Date(year, month, 1).toLocaleString('en-US', { timeZone: timezone }));
    const endDate = new Date(new Date(year, month + 1, 0).toLocaleString('en-US', { timeZone: timezone })); // Last day of month
    
    logger.debug('Searching for moon phases in user timezone', { 
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      timezone
    }, 'AstronomicalEventsService');

    // Find all moon phases in this month
    const phaseTypes = [
      { name: 'New Moon' as const, targetAngle: 0 },
      { name: 'Waxing Crescent' as const, targetAngle: 45 },
      { name: 'First Quarter' as const, targetAngle: 90 },
      { name: 'Waxing Gibbous' as const, targetAngle: 135 },
      { name: 'Full Moon' as const, targetAngle: 180 },
      { name: 'Waning Gibbous' as const, targetAngle: 225 },
      { name: 'Last Quarter' as const, targetAngle: 270 },
      { name: 'Waning Crescent' as const, targetAngle: 315 }
    ];

    for (const phaseType of phaseTypes) {
      try {
        const phaseDate = await this.findMoonPhaseInPeriod(
          startDate, 
          endDate, 
          phaseType.targetAngle,
          timezone
        );
        
        if (phaseDate) {
          // Format date in user's timezone
          const formattedDate = phaseDate.toLocaleDateString('en-CA', { timeZone: timezone });
          phases.push({
            phase: phaseType.name,
            date: formattedDate
          });
          
          logger.debug('Found moon phase', {
            phase: phaseType.name,
            date: formattedDate,
            timezone,
            targetAngle: phaseType.targetAngle
          }, 'AstronomicalEventsService');
        }
      } catch (error) {
        logger.error('Failed to find moon phase', {
          phase: phaseType.name,
          targetAngle: phaseType.targetAngle,
          error
        }, 'AstronomicalEventsService');
      }
    }

    return phases.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get all events for a month
   */
  private async getMonthlyEvents(
    year: number, 
    month: number, 
    coordinates: { lat: number; lng: number },
    timezone: string
  ): Promise<AstronomicalEvent[]> {
    const events: AstronomicalEvent[] = [];

    const [mercuryEvents, seasonalEvents, eclipses] = await Promise.all([
      this.calculateMercuryRetrogradeForMonth(year, month, timezone),
      this.calculateSolsticesEquinoxesForMonth(year, month, timezone),
      this.calculateEclipsesForMonth(year, month, coordinates, timezone)
    ]);

    events.push(...mercuryEvents);
    events.push(...seasonalEvents);
    events.push(...eclipses);

    return events.sort((a, b) => {
      const dateA = a.date || a.startDate || '';
      const dateB = b.date || b.startDate || '';
      return dateA.localeCompare(dateB);
    });
  }

  /**
   * Calculate Mercury retrograde periods for a month
   */
  private async calculateMercuryRetrogradeForMonth(
    year: number, 
    month: number,
    timezone: string
  ): Promise<AstronomicalEvent[]> {
    const events: AstronomicalEvent[] = [];
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    try {
      // Check each day of the month for Mercury retrograde changes
      for (let day = 1; day <= endDate.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        const nextDate = new Date(year, month, day + 1);
        
        const [currentSpeed, nextSpeed] = await Promise.all([
          this.getMercurySpeed(currentDate),
          this.getMercurySpeed(nextDate)
        ]);

        // Retrograde starts when speed goes from positive to negative
        if (currentSpeed > 0 && nextSpeed < 0) {
          const formattedDate = currentDate.toLocaleDateString('en-CA', { timeZone: timezone });
          events.push({
            type: EventType.MERCURY_RETROGRADE_START,
            name: 'Mercury Retrograde Begins',
            date: formattedDate
          });
        }

        // Retrograde ends when speed goes from negative to positive
        if (currentSpeed < 0 && nextSpeed > 0) {
          const formattedDate = currentDate.toLocaleDateString('en-CA', { timeZone: timezone });
          events.push({
            type: EventType.MERCURY_RETROGRADE_END,
            name: 'Mercury Retrograde Ends',
            date: formattedDate
          });
        }
      }
    } catch (error) {
      logger.error('Failed to calculate Mercury retrograde for month', {
        year,
        month: month + 1,
        timezone,
        error
      }, 'AstronomicalEventsService');
    }

    return events;
  }

  /**
   * Calculate solstices and equinoxes for a month
   */
  private async calculateSolsticesEquinoxesForMonth(
    year: number, 
    month: number,
    timezone: string
  ): Promise<AstronomicalEvent[]> {
    const events: AstronomicalEvent[] = [];

    // Define seasonal events with their approximate months
    const seasonalEvents = [
      { month: 2, type: EventType.SPRING_EQUINOX, name: 'Spring Equinox' }, // March
      { month: 5, type: EventType.SUMMER_SOLSTICE, name: 'Summer Solstice' }, // June  
      { month: 8, type: EventType.AUTUMN_EQUINOX, name: 'Autumn Equinox' }, // September
      { month: 11, type: EventType.WINTER_SOLSTICE, name: 'Winter Solstice' } // December
    ];

    for (const event of seasonalEvents) {
      if (event.month === month) {
        try {
          const eventDate = await this.calculateSeasonalEvent(year, event.type, timezone);
          if (eventDate) {
            const formattedDate = eventDate.toLocaleDateString('en-CA', { timeZone: timezone });
            events.push({
              type: event.type,
              name: event.name,
              date: formattedDate
            });
          }
        } catch (error) {
          logger.error('Failed to calculate seasonal event', {
            year,
            month: month + 1,
            eventType: event.type,
            timezone,
            error
          }, 'AstronomicalEventsService');
        }
      }
    }

    return events;
  }

  /**
   * Calculate eclipses for a month
   */
  private async calculateEclipsesForMonth(
    year: number, 
    month: number, 
    coordinates: { lat: number; lng: number },
    timezone: string
  ): Promise<AstronomicalEvent[]> {
    const events: AstronomicalEvent[] = [];
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    try {
      // Find solar eclipses in this month
      const solarEclipses = await this.findEclipsesInPeriod(
        startDate, 
        endDate, 
        'solar', 
        coordinates,
        timezone
      );
      events.push(...solarEclipses);

      // Find lunar eclipses in this month
      const lunarEclipses = await this.findEclipsesInPeriod(
        startDate, 
        endDate, 
        'lunar', 
        coordinates,
        timezone
      );
      events.push(...lunarEclipses);

    } catch (error) {
      logger.error('Failed to calculate eclipses for month', {
        year,
        month: month + 1,
        timezone,
        error
      }, 'AstronomicalEventsService');
    }

    return events;
  }

  private async calculateSeasonalEvent(year: number, eventType: EventType, timezone: string): Promise<Date | null> {
    try {
      // Target longitudes for seasonal events
      let targetLongitude: number;
      switch (eventType) {
        case EventType.SPRING_EQUINOX: targetLongitude = 0; break;
        case EventType.SUMMER_SOLSTICE: targetLongitude = 90; break;
        case EventType.AUTUMN_EQUINOX: targetLongitude = 180; break;
        case EventType.WINTER_SOLSTICE: targetLongitude = 270; break;
        default: return null;
      }

      // Approximate dates for each event (starting point for search)
      const approximateDates = {
        [EventType.SPRING_EQUINOX]: new Date(year, 2, 20), // March 20
        [EventType.SUMMER_SOLSTICE]: new Date(year, 5, 21), // June 21
        [EventType.AUTUMN_EQUINOX]: new Date(year, 8, 23), // September 23
        [EventType.WINTER_SOLSTICE]: new Date(year, 11, 21) // December 21
      };

      const startDate = approximateDates[eventType];
      if (!startDate) return null;

      // Search within ±3 days of approximate date
      const searchRange = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
      
      return await this.findSunLongitudeCrossing(
        new Date(startDate.getTime() - searchRange),
        new Date(startDate.getTime() + searchRange),
        targetLongitude,
        timezone
      );

    } catch (error) {
      logger.error('Failed to calculate seasonal event', { year, eventType, timezone, error });
      return null;
    }
  }

  /**
   * Find when the Sun crosses a specific longitude using binary search
   */
  private async findSunLongitudeCrossing(
    startDate: Date,
    endDate: Date,
    targetLongitude: number,
    timezone: string,
    tolerance: number = 0.01 // degrees
  ): Promise<Date | null> {
    try {
      let left = startDate.getTime();
      let right = endDate.getTime();
      
      // Binary search for the crossing
      while (right - left > 60000) { // 1 minute precision
        const mid = left + (right - left) / 2;
        const midDate = new Date(mid);
        
        const julianDay = await this.calculateJulianDay(midDate);
        const sunLongitude = await this.getPlanetPosition(julianDay, swisseph.SE_SUN);
        
        // Normalize longitude to 0-360
        const normalizedLongitude = ((sunLongitude % 360) + 360) % 360;
        const normalizedTarget = ((targetLongitude % 360) + 360) % 360;
        
        // Handle crossing 0 degrees (360/0 boundary)
        let difference = normalizedLongitude - normalizedTarget;
        if (Math.abs(difference) > 180) {
          difference = difference > 0 ? difference - 360 : difference + 360;
        }
        
        if (Math.abs(difference) < tolerance) {
          // Return date in user's timezone context
          return new Date(midDate.toLocaleString('en-US', { timeZone: timezone }));
        }
        
        // Determine which half contains the crossing
        if (difference < 0) {
          left = mid;
        } else {
          right = mid;
        }
      }
      
      const resultDate = new Date((left + right) / 2);
      return new Date(resultDate.toLocaleString('en-US', { timeZone: timezone }));
      
    } catch (error) {
      logger.error('Failed to find sun longitude crossing', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        targetLongitude,
        timezone,
        error
      }, 'AstronomicalEventsService');
      return null;
    }
  }

  private async findNextMoonPhase(date: Date, phaseType: 'new' | 'full', timezone: string): Promise<Date | null> {
    const targetAngle = phaseType === 'new' ? 0 : 180;
    const maxDays = 35; // Look ahead up to 35 days
    
    for (let i = 1; i <= maxDays; i++) {
      // Create date in user's timezone context
      const checkDate = new Date(date.getTime() + (i * 24 * 60 * 60 * 1000));
      
      try {
        const julianDay = await this.calculateJulianDay(checkDate);
        const [sunLongitude, moonLongitude] = await Promise.all([
          this.getPlanetPosition(julianDay, swisseph.SE_SUN),
          this.getPlanetPosition(julianDay, swisseph.SE_MOON)
        ]);

        let phaseAngle = moonLongitude - sunLongitude;
        if (phaseAngle < 0) phaseAngle += 360;
        if (phaseAngle > 360) phaseAngle -= 360;

        // Check if we're close to the target angle (within 2 degrees)
        const angleDiff = Math.min(
          Math.abs(phaseAngle - targetAngle),
          Math.abs(phaseAngle - targetAngle + 360),
          Math.abs(phaseAngle - targetAngle - 360)
        );

        if (angleDiff < 2) {
          // Return date adjusted for user's timezone calendar
          return new Date(checkDate.toLocaleString('en-US', { timeZone: timezone }));
        }
      } catch (error) {
        // Continue checking other dates if one fails
        continue;
      }
    }
    
    return null;
  }

  private async findMoonPhaseInPeriod(
    startDate: Date, 
    endDate: Date, 
    targetAngle: number,
    timezone: string
  ): Promise<Date | null> {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    let closestDate: Date | null = null;
    let closestDifference = Infinity;
    
    logger.debug('Searching for moon phase', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      targetAngle,
      totalDays,
      timezone
    }, 'AstronomicalEventsService');
    
    for (let i = 0; i <= totalDays; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + i);
      
      if (checkDate > endDate) break;
      
      try {
        const julianDay = await this.calculateJulianDay(checkDate);
        const [sunLongitude, moonLongitude] = await Promise.all([
          this.getPlanetPosition(julianDay, swisseph.SE_SUN),
          this.getPlanetPosition(julianDay, swisseph.SE_MOON)
        ]);

        let phaseAngle = moonLongitude - sunLongitude;
        if (phaseAngle < 0) phaseAngle += 360;
        if (phaseAngle > 360) phaseAngle -= 360;

        // Check if we're close to the target angle
        const angleDiff = Math.min(
          Math.abs(phaseAngle - targetAngle),
          Math.abs(phaseAngle - targetAngle + 360),
          Math.abs(phaseAngle - targetAngle - 360)
        );

        if (angleDiff < closestDifference) {
          closestDifference = angleDiff;
          closestDate = new Date(checkDate);
        }

        // If we're very close, we found it
        if (angleDiff < 1.5) { // Tighter tolerance
          logger.debug('Found moon phase match', {
            date: checkDate.toISOString(),
            phaseAngle,
            targetAngle,
            angleDiff,
            timezone
          }, 'AstronomicalEventsService');
          
          // Return date in user's timezone calendar context
          return new Date(checkDate.toLocaleString('en-US', { timeZone: timezone }));
        }
      } catch (error) {
        // Continue checking other dates if one fails
        continue;
      }
    }
    
    // Return closest match if we found one within reasonable tolerance
    if (closestDate && closestDifference < 10) {
      logger.debug('Returning closest moon phase match', {
        date: closestDate.toISOString(),
        difference: closestDifference,
        timezone
      }, 'AstronomicalEventsService');
      return new Date(closestDate.toLocaleString('en-US', { timeZone: timezone }));
    }
    
    logger.warn('No moon phase found', {
      targetAngle,
      closestDifference,
      timezone
    }, 'AstronomicalEventsService');
    
    return null;
  }

  private async checkForEclipsesToday(
    date: Date, 
    coordinates: { lat: number; lng: number },
    timezone: string
  ): Promise<AstronomicalEvent[]> {
    // For daily checks, we'll do a simplified check
    // Full eclipse calculations are complex and should be done monthly
    return [];
  }

  private async checkForMercuryEventsToday(date: Date, timezone: string): Promise<AstronomicalEvent[]> {
    const events: AstronomicalEvent[] = [];
    
    try {
      const yesterday = new Date(date);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const [yesterdaySpeed, todaySpeed] = await Promise.all([
        this.getMercurySpeed(yesterday),
        this.getMercurySpeed(date)
      ]);

      if (yesterdaySpeed > 0 && todaySpeed < 0) {
        events.push({
          type: EventType.MERCURY_RETROGRADE_START,
          name: 'Mercury Retrograde Begins',
          date: date.toLocaleDateString('en-CA', { timeZone: timezone })
        });
      }

      if (yesterdaySpeed < 0 && todaySpeed > 0) {
        events.push({
          type: EventType.MERCURY_RETROGRADE_END,
          name: 'Mercury Retrograde Ends',
          date: date.toLocaleDateString('en-CA', { timeZone: timezone })
        });
      }
    } catch (error) {
      logger.error('Failed to check Mercury events for today', { 
        date: date.toISOString(), 
        timezone, 
        error 
      });
    }

    return events;
  }

  private async checkForSeasonalEventsToday(date: Date, timezone: string): Promise<AstronomicalEvent[]> {
    const events: AstronomicalEvent[] = [];
    const month = date.getMonth();
    const day = date.getDate();

    // Check if today might be a seasonal event (rough approximation)
    const seasonalDates = [
      { month: 2, day: 20, type: EventType.SPRING_EQUINOX, name: 'Spring Equinox' },
      { month: 5, day: 21, type: EventType.SUMMER_SOLSTICE, name: 'Summer Solstice' },
      { month: 8, day: 22, type: EventType.AUTUMN_EQUINOX, name: 'Autumn Equinox' },
      { month: 11, day: 21, type: EventType.WINTER_SOLSTICE, name: 'Winter Solstice' }
    ];

    for (const seasonalDate of seasonalDates) {
      if (seasonalDate.month === month && Math.abs(seasonalDate.day - day) <= 2) {
        // Double-check with precise calculation
        const preciseDate = await this.calculateSeasonalEvent(date.getFullYear(), seasonalDate.type, timezone);
        if (preciseDate && Math.abs(preciseDate.getTime() - date.getTime()) < 24 * 60 * 60 * 1000) {
          events.push({
            type: seasonalDate.type,
            name: seasonalDate.name,
            date: date.toLocaleDateString('en-CA', { timeZone: timezone })
          });
        }
      }
    }

    return events;
  }

  private async findEclipsesInPeriod(
    startDate: Date,
    endDate: Date,
    eclipseType: 'solar' | 'lunar',
    coordinates: { lat: number; lng: number },
    timezone: string
  ): Promise<AstronomicalEvent[]> {
    // Eclipse calculations are very complex
    // For MVP, return empty array and implement later
    return [];
  }

  // Helper methods for Swiss Ephemeris calculations

  private async calculateJulianDay(date: Date): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate();
        const hour = date.getUTCHours() + date.getUTCMinutes() / 60;
        
        swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL, (julday: any) => {
          if (typeof julday !== 'number' || isNaN(julday)) {
            reject(new Error(`Invalid Julian day calculation: ${julday}`));
            return;
          }
          resolve(julday);
        });
      } catch (error) {
        reject(new Error(`Julian day calculation failed: ${error}`));
      }
    });
  }

  private async getPlanetPosition(julianDay: number, planet: number): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const flag = swisseph.SEFLG_MOSEPH;
        
        swisseph.swe_calc_ut(julianDay, planet, flag, (result: any) => {
          if (!result || result.error) {
            reject(new Error(`Planet position calculation failed: ${result?.error || 'Unknown error'}`));
            return;
          }
          
          let longitude;
          if (Array.isArray(result) && result.length > 0) {
            longitude = result[0];
          } else if (result.longitude !== undefined) {
            longitude = result.longitude;
          } else if (result.xx && Array.isArray(result.xx) && result.xx.length > 0) {
            longitude = result.xx[0];
          } else {
            reject(new Error(`Unexpected result format: ${JSON.stringify(result)}`));
            return;
          }
          
          if (typeof longitude !== 'number' || isNaN(longitude)) {
            reject(new Error(`Invalid longitude value: ${longitude}`));
            return;
          }
          
          resolve(longitude);
        });
      } catch (error) {
        reject(new Error(`Planet position calculation failed: ${error}`));
      }
    });
  }

  private getPhaseNameFromAngle(angle: number): MoonPhase['phase'] {
    if (angle < 22.5 || angle >= 337.5) return 'New Moon';
    if (angle < 67.5) return 'Waxing Crescent';
    if (angle < 112.5) return 'First Quarter';
    if (angle < 157.5) return 'Waxing Gibbous';
    if (angle < 202.5) return 'Full Moon';
    if (angle < 247.5) return 'Waning Gibbous';
    if (angle < 292.5) return 'Last Quarter';
    return 'Waning Crescent';
  }

  private async getMercurySpeed(date: Date): Promise<number> {
    try {
      const julianDay = await this.calculateJulianDay(date);
      const julianDay2 = julianDay + 1; // Next day
      
      const [pos1, pos2] = await Promise.all([
        this.getPlanetPosition(julianDay, swisseph.SE_MERCURY),
        this.getPlanetPosition(julianDay2, swisseph.SE_MERCURY)
      ]);
      
      // Calculate daily speed (degrees per day)
      let speed = pos2 - pos1;
      
      // Handle crossing 0 degrees
      if (speed > 180) speed -= 360;
      if (speed < -180) speed += 360;
      
      return speed;
    } catch (error) {
      logger.error('Failed to calculate Mercury speed', { date: date.toISOString(), error });
      return 0;
    }
  }
}