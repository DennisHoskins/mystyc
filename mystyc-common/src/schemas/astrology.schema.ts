import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';
import { 
  ZodiacSign, 
  PlanetaryPositionSchema,
  PlanetInteractionSchema,
  ElementInteractionSchema,
  ModalityInteractionSchema
} from './astrology-knowledge.schema';
import { SignSchema } from './astrology-reference.schema';

// Schema for individual planetary data (for reference data assembly)
export const PlanetaryDataItemSchema = z.object({
  sign: ZodiacSign,
  position: PlanetaryPositionSchema,
  signInfo: SignSchema
}).strict();

// Schema for complete planetary data (for reference data assembly) 
export const PlanetaryDataSchema = z.object({
  Sun: PlanetaryDataItemSchema,
  Moon: PlanetaryDataItemSchema,
  Rising: PlanetaryDataItemSchema,
  Venus: PlanetaryDataItemSchema,
  Mars: PlanetaryDataItemSchema
}).strict();

// Schema for all interaction types (for reference data assembly)
export const InteractionsSchema = z.object({
  planets: z.record(z.string(), PlanetInteractionSchema),
  elements: z.record(z.string(), ElementInteractionSchema),
  modalities: z.record(z.string(), ModalityInteractionSchema)
}).strict();

// Complete assembled astrology data (for reference data assembly)
export const UserAstrologyDataSchema = z.object({
  planetaryData: PlanetaryDataSchema,
  interactions: InteractionsSchema
}).strict();

// Response wrapper for API endpoints (for reference data assembly)
export const UserAstrologyResponseSchema = z.object({
  astrologyData: UserAstrologyDataSchema.nullable(),
  error: z.string().optional()
}).strict();

// ============================================================================
// UTILITY FUNCTIONS & CONSTANTS
// ============================================================================

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

// Type exports
export type PlanetaryDataItem = z.infer<typeof PlanetaryDataItemSchema>;
export type PlanetaryData = z.infer<typeof PlanetaryDataSchema>;
export type Interactions = z.infer<typeof InteractionsSchema>;
export type UserAstrologyData = z.infer<typeof UserAstrologyDataSchema>;
export type UserAstrologyResponse = z.infer<typeof UserAstrologyResponseSchema>;

// Utility types
export type InteractionKey = string; // Format: "Item1-Item2" (e.g., "Sun-Moon", "Fire-Water")
export type RequiredPlanetInteraction = typeof REQUIRED_PLANET_INTERACTIONS[number];

// Validation functions
export const validateUserAstrologyData = (data: unknown) => 
  validateWithError(UserAstrologyDataSchema, data, { schema: 'UserAstrologyData' });
export const validateUserAstrologyDataSafe = (data: unknown) => 
  validateSafely(UserAstrologyDataSchema, data);
export const validateUserAstrologyResponse = (data: unknown) => 
  validateWithError(UserAstrologyResponseSchema, data, { schema: 'UserAstrologyResponse' });
export const validateUserAstrologyResponseSafe = (data: unknown) => 
  validateSafely(UserAstrologyResponseSchema, data);