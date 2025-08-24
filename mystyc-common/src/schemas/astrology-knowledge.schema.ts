import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

// Enums
export const PlanetType = z.enum(['Sun', 'Moon', 'Rising', 'Venus', 'Mars']);
export const ZodiacSign = z.enum(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']);
export const ElementType = z.enum(['Fire', 'Earth', 'Air', 'Water']);
export const ModalityType = z.enum(['Cardinal', 'Fixed', 'Mutable']);
export const DynamicType = z.enum(['harmony', 'tension', 'complementary', 'amplification']);

// 1. Planetary Positions Schema
export const PlanetaryPositionInputSchema = z.object({
  planet: PlanetType,
  sign: ZodiacSign,
  energyType: z.string().min(1).max(50).trim(),
  description: z.string().min(50).max(1000).trim(),
  keywords: z.array(z.string().min(1).trim()).min(3).max(10),
}).strict();

export const PlanetaryPositionSchema = PlanetaryPositionInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 2. Element Interactions Schema
export const ElementInteractionInputSchema = z.object({
  element1: ElementType,
  element2: ElementType,
  dynamic: DynamicType,
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim(),
  action: z.string().min(20).max(300).trim()
}).strict();

export const ElementInteractionSchema = ElementInteractionInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 3. Modality Interactions Schema  
export const ModalityInteractionInputSchema = z.object({
  modality1: ModalityType,
  modality2: ModalityType,
  dynamic: DynamicType,
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim(),
  action: z.string().min(20).max(300).trim()
}).strict();

export const ModalityInteractionSchema = ModalityInteractionInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 4. Planet Interactions Schema
export const PlanetInteractionInputSchema = z.object({
  planet1: PlanetType,
  planet2: PlanetType,
  dynamic: DynamicType,
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim(),
  action: z.string().min(20).max(300).trim()
}).strict();

export const PlanetInteractionSchema = PlanetInteractionInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Type exports
export type ZodiacSignType = z.infer<typeof ZodiacSign>;
export type ElementType = z.infer<typeof ElementType>;
export type PlanetType = z.infer<typeof PlanetType>;
export type ModalityType = z.infer<typeof ModalityType>;
export type DynamicType = z.infer<typeof DynamicType>;
export type PlanetaryPosition = z.infer<typeof PlanetaryPositionSchema>;
export type PlanetaryPositionInput = z.infer<typeof PlanetaryPositionInputSchema>;
export type ElementInteraction = z.infer<typeof ElementInteractionSchema>;
export type ElementInteractionInput = z.infer<typeof ElementInteractionInputSchema>;
export type ModalityInteraction = z.infer<typeof ModalityInteractionSchema>;
export type ModalityInteractionInput = z.infer<typeof ModalityInteractionInputSchema>;
export type PlanetInteraction = z.infer<typeof PlanetInteractionSchema>;
export type PlanetInteractionInput = z.infer<typeof PlanetInteractionInputSchema>;

// Validation functions
export const validatePlanetaryPosition = (data: unknown) => 
  validateWithError(PlanetaryPositionSchema, data, { schema: 'PlanetaryPosition' });
export const validatePlanetaryPositionSafe = (data: unknown) => 
  validateSafely(PlanetaryPositionSchema, data);

export const validateElementInteraction = (data: unknown) => 
  validateWithError(ElementInteractionSchema, data, { schema: 'ElementInteraction' });
export const validateElementInteractionSafe = (data: unknown) => 
  validateSafely(ElementInteractionSchema, data);

export const validateModalityInteraction = (data: unknown) => 
  validateWithError(ModalityInteractionSchema, data, { schema: 'ModalityInteraction' });
export const validateModalityInteractionSafe = (data: unknown) => 
  validateSafely(ModalityInteractionSchema, data);

export const validatePlanetInteraction = (data: unknown) => 
  validateWithError(PlanetInteractionSchema, data, { schema: 'PlanetInteraction' });
export const validatePlanetInteractionSafe = (data: unknown) => 
  validateSafely(PlanetInteractionSchema, data);