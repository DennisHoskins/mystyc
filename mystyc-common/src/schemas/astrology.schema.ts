import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';
import { 
  ZodiacSign, 
  PlanetType,
  PlanetaryPositionSchema,
  PlanetInteractionSchema,
  ElementInteractionSchema,
  ModalityInteractionSchema
} from './astrology-knowledge.schema';
import { SignSchema } from './astrology-reference.schema';

// Schema for individual planetary data (sign + position + signInfo)
export const PlanetaryDataItemSchema = z.object({
  sign: ZodiacSign,
  position: PlanetaryPositionSchema,
  signInfo: SignSchema
}).strict();

// Schema for complete planetary data (all 5 planets) - matches [K in PlanetType] structure
export const PlanetaryDataSchema = z.object({
  Sun: PlanetaryDataItemSchema,
  Moon: PlanetaryDataItemSchema,
  Rising: PlanetaryDataItemSchema,
  Venus: PlanetaryDataItemSchema,
  Mars: PlanetaryDataItemSchema
}).strict();

// Schema for all interaction types
export const InteractionsSchema = z.object({
  planets: z.record(z.string(), PlanetInteractionSchema),
  elements: z.record(z.string(), ElementInteractionSchema),
  modalities: z.record(z.string(), ModalityInteractionSchema)
}).strict();

// Complete assembled astrology data
export const UserAstrologyDataSchema = z.object({
  planetaryData: PlanetaryDataSchema,
  interactions: InteractionsSchema
}).strict();

// Response wrapper for API endpoints
export const UserAstrologyResponseSchema = z.object({
  astrologyData: UserAstrologyDataSchema.nullable(),
  error: z.string().optional()
}).strict();

// Standalone Astrology schema
export const AstrologySchema = z.object({
  // Top-level signs for easy access and backwards compatibility
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  risingSign: ZodiacSign,
  venusSign: ZodiacSign,
  marsSign: ZodiacSign,
  
  // Complete pre-assembled astrology data (OPTIONAL for legacy support)
  planetaryData: PlanetaryDataSchema.optional(),
  interactions: InteractionsSchema.optional(),
  
  // Metadata
  createdAt: z.date(),
  lastCalculatedAt: z.date().optional(), // Optional for legacy data
}).passthrough(); // Allow ALL extra properties (including _id, MongoDB fields)

// Input schema for creating astrology data (without metadata)
export const AstrologyInputSchema = z.object({
  sunSign: ZodiacSign,
  moonSign: ZodiacSign,
  risingSign: ZodiacSign,
  venusSign: ZodiacSign,
  marsSign: ZodiacSign,
  planetaryData: PlanetaryDataSchema,
  interactions: InteractionsSchema
}).strict();

// ============================================================================
// UTILITY FUNCTIONS & CONSTANTS (moved from user-astrology-data.interface.ts)
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

// Type exports - replaces all TypeScript interfaces
export type PlanetaryDataItem = z.infer<typeof PlanetaryDataItemSchema>;
export type PlanetaryData = z.infer<typeof PlanetaryDataSchema>;
export type Interactions = z.infer<typeof InteractionsSchema>;
export type UserAstrologyData = z.infer<typeof UserAstrologyDataSchema>; // Replaces interface
export type UserAstrologyResponse = z.infer<typeof UserAstrologyResponseSchema>; // Replaces interface
export type Astrology = z.infer<typeof AstrologySchema>;
export type AstrologyInput = z.infer<typeof AstrologyInputSchema>;

// Utility types (moved from interface file)
export type InteractionKey = string; // Format: "Item1-Item2" (e.g., "Sun-Moon", "Fire-Water")
export type RequiredPlanetInteraction = typeof REQUIRED_PLANET_INTERACTIONS[number];

// Validation functions
export const validateAstrology = (data: unknown) => 
  validateWithError(AstrologySchema, data, { schema: 'Astrology' });
export const validateAstrologySafe = (data: unknown) => 
  validateSafely(AstrologySchema, data);
export const validateAstrologyInput = (data: unknown) => 
  validateWithError(AstrologyInputSchema, data, { schema: 'AstrologyInput' });
export const validateAstrologyInputSafe = (data: unknown) => 
  validateSafely(AstrologyInputSchema, data);
export const validateUserAstrologyData = (data: unknown) => 
  validateWithError(UserAstrologyDataSchema, data, { schema: 'UserAstrologyData' });
export const validateUserAstrologyDataSafe = (data: unknown) => 
  validateSafely(UserAstrologyDataSchema, data);
export const validateUserAstrologyResponse = (data: unknown) => 
  validateWithError(UserAstrologyResponseSchema, data, { schema: 'UserAstrologyResponse' });
export const validateUserAstrologyResponseSafe = (data: unknown) => 
  validateSafely(UserAstrologyResponseSchema, data);