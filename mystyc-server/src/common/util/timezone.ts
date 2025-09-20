import { logger } from '@/common/util/logger';

class Timezone {
  /**
   * Calculate timezone offsets for multiple timezones
   * @param timezones - Array of IANA timezone strings
   * @returns Promise<Array<{timezone: string, offsetHours: number}>>
   */
  async getTimezonesWithOffsets(timezones: string[]): Promise<Array<{timezone: string, offsetHours: number}>> {
    return timezones.map(tz => ({
      timezone: tz,
      offsetHours: this.getTimezoneOffset(tz)
    }));
  }

  /**
   * Calculate timezone offset from UTC in hours
   * @param timezone - IANA timezone string (e.g., 'America/Edmonton', 'Europe/London')
   * @returns number - Offset from UTC in hours (positive for ahead, negative for behind)
   */
  private getTimezoneOffset(timezone: string): number {
    try {
      const now = new Date();
      
      // Use Intl.DateTimeFormat to get timezone info
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'longOffset'
      });
      
      const parts = formatter.formatToParts(now);
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
      return this.getTimezoneOffsetFallback(timezone);
    } catch (error) {
      logger.warn(`Invalid timezone: ${timezone}, defaulting to UTC`, { timezone }, 'Timezone');
      return 0;
    }
  }

  /**
   * Fallback method to calculate timezone offset
   */
  private getTimezoneOffsetFallback(timezone: string): number {
    const now = new Date();
    
    // Get minutes since epoch in UTC
    const utcTime = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    );
    
    // Get time in target timezone
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: timezone })).getTime();
    
    // Calculate offset in hours
    return (localTime - utcTime) / (1000 * 60 * 60);
  }
}

// Export singleton instance
export const timezone = new Timezone();
