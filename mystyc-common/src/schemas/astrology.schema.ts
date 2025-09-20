import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';
import { ZodiacSign } from './astrology-knowledge.schema';

// Schema for individual planetary interaction scores
const PlanetaryInteractionScoreSchema = z.object({
  score: z.number().min(-1).max(1),
  description: z.string().min(50).max(1000).optional(),
}).strict();

const AISummarySchema = z.object({
  description: z.string().min(50).max(1000).optional(),
  strengths: z.string().min(20).max(1000).optional(),
  challenges: z.string().min(20).max(1000).optional(),
  action: z.string().min(20).max(1000).optional()
}).strict();

// Schema for calculated planetary data
const PlanetaryDataCalculatedSchema = z.object({
  sign: ZodiacSign,
  degreesInSign: z.number().min(0).max(29.999).optional(),
  absoluteDegrees: z.number().min(0).max(359.999).optional(),  
  totalScore: z.number().min(-1).max(1),
  summary: AISummarySchema.optional(),
  interactions: z.record(PlanetaryInteractionScoreSchema).optional()
}).strict();

// Main calculated astrology schema
export const AstrologyCalculatedSchema = z.object({
  sun: PlanetaryDataCalculatedSchema,
  moon: PlanetaryDataCalculatedSchema,
  rising: PlanetaryDataCalculatedSchema,
  venus: PlanetaryDataCalculatedSchema,
  mars: PlanetaryDataCalculatedSchema,
  totalScore: z.number().min(-1).max(1),
  summary: AISummarySchema.optional(),
  createdAt: z.date(),
  lastCalculatedAt: z.date()
}).strict();

// Helper function to create consistent interaction keys
export function createInteractionKey(item1: string, item2: string): string {
  return `${item1}-${item2}`;
}

// Planet combinations for planetary interactions
export const REQUIRED_PLANET_INTERACTIONS = [
  'Sun-Moon', 'Sun-Rising', 'Sun-Mars', 'Sun-Venus',
  'Moon-Rising', 'Moon-Venus', 'Moon-Mars',
  'Rising-Venus', 'Rising-Mars', 'Venus-Mars'
] as const;

// Utility types
export type InteractionKey = string;
export type RequiredPlanetInteraction = typeof REQUIRED_PLANET_INTERACTIONS[number];

// Validation functions
export const validateAstrologyCalculated = (data: unknown) => 
  validateWithError(AstrologyCalculatedSchema, data, { schema: 'AstrologyCalculated' });
export const validateAstrologyCalculatedSafe = (data: unknown) => 
  validateSafely(AstrologyCalculatedSchema, data);

