import { 
  PlanetType, 
  ZodiacSignType, 
  Sign, 
  PlanetaryPosition,
  PlanetInteraction,
  ElementInteraction,
  ModalityInteraction
} from '../schemas';

/**
 * Complete astrology data for a user - everything needed to render the admin astrology page
 * This replaces 60+ individual API calls with a single optimized fetch
 */
export interface UserAstrologyData {
  // Core planetary data for the zodiac panel
  planetaryData: {
    [K in PlanetType]: {
      sign: ZodiacSignType;
      position: PlanetaryPosition;
      signInfo: Sign;
    }
  };
  
  // All interaction data needed for the three cards
  interactions: {
    // Planet-to-planet interactions (e.g., "Sun-Moon", "Venus-Mars")
    planets: Record<string, PlanetInteraction>;
    
    // Element interactions (e.g., "Fire-Water", "Earth-Air") 
    elements: Record<string, ElementInteraction>;
    
    // Modality interactions (e.g., "Cardinal-Fixed", "Mutable-Cardinal")
    modalities: Record<string, ModalityInteraction>;
  };
}

/**
 * Utility type for interaction keys used in the interactions records
 */
export type InteractionKey = string; // Format: "Item1-Item2" (e.g., "Sun-Moon", "Fire-Water")

/**
 * Response wrapper for the admin endpoint
 */
export interface UserAstrologyResponse {
  astrologyData: UserAstrologyData | null;
  error?: string;
}

// Helper function to create consistent interaction keys
export function createInteractionKey(item1: string, item2: string): InteractionKey {
  return `${item1}-${item2}`;
}

// All the planet combinations we need for the three cards
export const REQUIRED_PLANET_INTERACTIONS = [
  // Core Identity (Sun with others)
  'Sun-Moon',
  'Sun-Rising', 
  'Sun-Mars',
  'Sun-Venus',
  
  // Emotional Expression (Moon with others)
  'Moon-Rising',
  'Moon-Venus', 
  'Moon-Mars',
  
  // Social Relationships
  'Rising-Venus',
  'Rising-Mars',
  'Venus-Mars'
] as const;

export type RequiredPlanetInteraction = typeof REQUIRED_PLANET_INTERACTIONS[number];