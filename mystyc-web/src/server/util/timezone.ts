import { logger } from "@/util/logger";

/**
 * Calculate timezone offset from UTC in hours for a given IANA timezone
 * @param timezone - IANA timezone string (e.g., 'America/New_York')
 * @returns number - Offset from UTC in hours (positive for ahead, negative for behind)
 */
export function getTimezoneOffset(timezone: string): number {
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
    
    // Fallback: return 0 (UTC) if parsing fails
    return 0;
  } catch (error) {
    // Invalid timezone, default to UTC
    logger.error(error);
    return 0;
  }
}