import { ZodiacSignType } from '../schemas';
import { PlanetaryDegrees } from '../interfaces';

/**
 * Converts raw longitude from Swiss Ephemeris to sign and degree information
 * @param longitude - Raw longitude in degrees (0-360)
 * @returns PlanetaryDegrees with sign and degree details
 */
export function getLongitudeDetails(longitude: number): PlanetaryDegrees {
  const signs: ZodiacSignType[] = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];
  
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Calculate sign index (each sign is 30 degrees)
  const signIndex = Math.floor(normalizedLongitude / 30);
  
  // Calculate degrees within the sign
  const degreesInSign = normalizedLongitude % 30;
  
  return {
    sign: signs[signIndex],
    degreesInSign: Math.round(degreesInSign * 1000) / 1000, // Round to 3 decimal places
    absoluteDegrees: Math.round(normalizedLongitude * 1000) / 1000
  };
}

/**
 * Calculates the exact angular distance between two planetary positions
 * @param degrees1 - First planet's absolute degrees
 * @param degrees2 - Second planet's absolute degrees
 * @returns Angular distance in degrees (0-180)
 */
export function calculateAngularDistance(degrees1: number, degrees2: number): number {
  const rawDistance = Math.abs(degrees1 - degrees2);
  // Return the shorter distance around the zodiac wheel
  return Math.min(rawDistance, 360 - rawDistance);
}

/**
 * Determines if two planets are in aspect based on exact degrees
 * @param degrees1 - First planet's absolute degrees
 * @param degrees2 - Second planet's absolute degrees
 * @param orb - Allowed orb for aspects (default 8 degrees)
 * @returns Aspect information or null if no aspect
 */
export function getExactAspect(
  degrees1: number, 
  degrees2: number, 
  orb: number = 8
): { type: string; angle: number; orb: number; strength: number } | null {
  const angle = calculateAngularDistance(degrees1, degrees2);
  
  const aspects = [
    { name: 'conjunction', target: 0, strength: 1.0 },
    { name: 'sextile', target: 60, strength: 0.7 },
    { name: 'square', target: 90, strength: -0.8 },
    { name: 'trine', target: 120, strength: 1.0 },
    { name: 'opposition', target: 180, strength: 0.7 }
  ];
  
  for (const aspect of aspects) {
    const difference = Math.abs(angle - aspect.target);
    if (difference <= orb) {
      const orbUsed = difference;
      const exactness = 1 - (orbUsed / orb); // 1.0 = exact, 0.0 = at orb limit
      
      return {
        type: aspect.name,
        angle: angle,
        orb: orbUsed,
        strength: aspect.strength * exactness
      };
    }
  }
  
  return null;
}