import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';
import { SignComplete } from '../interfaces/astrology.interface';

// Enums
export const PlanetType = z.enum(['Sun', 'Moon', 'Rising', 'Venus', 'Mars']);
export const ZodiacSign = z.enum(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']);
export const ElementType = z.enum(['Fire', 'Earth', 'Air', 'Water']);
export const ModalityType = z.enum(['Cardinal', 'Fixed', 'Mutable']);
export const PolarityType = z.enum(['Masculine', 'Feminine']);
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


// 5. Polarity Interactions Schema  
export const PolarityInteractionInputSchema = z.object({
  polarity1: PolarityType,
  polarity2: PolarityType,
  dynamic: DynamicType,
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim(),
  action: z.string().min(20).max(300).trim()
}).strict();

export const PolarityInteractionSchema = PolarityInteractionInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 6. Sign Interactions Schema
export const SignInteractionInputSchema = z.object({
  sign1: ZodiacSign,
  sign2: ZodiacSign,
  distance: z.number().int().min(0).max(6),
  dynamic: DynamicType,
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim(),
  action: z.string().min(20).max(300).trim(),
  totalScore: z.number().min(-1).max(1),
  elementScore: z.number().min(-1).max(1),
  modalityScore: z.number().min(-1).max(1),
  polarityScore: z.number().min(-1).max(1),
  dynamicScore: z.number().min(-1).max(1)
}).strict();

export const SignInteractionSchema = SignInteractionInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Type exports
export type ZodiacSignType = z.infer<typeof ZodiacSign>;
export type ElementType = z.infer<typeof ElementType>;
export type PlanetType = z.infer<typeof PlanetType>;
export type ModalityType = z.infer<typeof ModalityType>;
export type PolarityType = z.infer<typeof PolarityType>;
export type DynamicType = z.infer<typeof DynamicType>;
export type PlanetaryPosition = z.infer<typeof PlanetaryPositionSchema>;
export type PlanetaryPositionInput = z.infer<typeof PlanetaryPositionInputSchema>;
export type ElementInteraction = z.infer<typeof ElementInteractionSchema>;
export type ElementInteractionInput = z.infer<typeof ElementInteractionInputSchema>;
export type ModalityInteraction = z.infer<typeof ModalityInteractionSchema>;
export type ModalityInteractionInput = z.infer<typeof ModalityInteractionInputSchema>;
export type PlanetInteraction = z.infer<typeof PlanetInteractionSchema>;
export type PlanetInteractionInput = z.infer<typeof PlanetInteractionInputSchema>;
export type PolarityInteraction = z.infer<typeof PolarityInteractionSchema>;
export type PolarityInteractionInput = z.infer<typeof PolarityInteractionInputSchema>;
export type SignInteraction = z.infer<typeof SignInteractionSchema>;
export type SignInteractionInput = z.infer<typeof SignInteractionInputSchema>;

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

export const validatePolarityInteraction = (data: unknown) => 
  validateWithError(PolarityInteractionSchema, data, { schema: 'PolarityInteraction' });
export const validatePolarityInteractionSafe = (data: unknown) => 
  validateSafely(PolarityInteractionSchema, data);

export const validateSignInteraction = (data: unknown) => 
  validateWithError(SignInteractionSchema, data, { schema: 'SignInteraction' });
export const validateSignInteractionSafe = (data: unknown) => 
  validateSafely(SignInteractionSchema, data);