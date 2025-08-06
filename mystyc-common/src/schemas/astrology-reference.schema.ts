import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

// 1. Sign Schema
export const SignInputSchema = z.object({
  sign: z.enum(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']),
  element: z.enum(['Fire', 'Earth', 'Air', 'Water']),
  modality: z.enum(['Cardinal', 'Fixed', 'Mutable']),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim()
}).strict();

export const SignSchema = SignInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 2. Planet Schema
export const PlanetInputSchema = z.object({
  planet: z.enum(['Sun', 'Moon', 'Rising', 'Venus', 'Mars']),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  importance: z.number().int().min(1).max(5),
  energyType: z.string().min(1).max(50).trim()
}).strict();

export const PlanetSchema = PlanetInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 3. Element Schema  
export const ElementInputSchema = z.object({
  element: z.enum(['Fire', 'Earth', 'Air', 'Water']),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim()
}).strict();

export const ElementSchema = ElementInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 4. Modality Schema
export const ModalityInputSchema = z.object({
  modality: z.enum(['Cardinal', 'Fixed', 'Mutable']),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim()
}).strict();

export const ModalitySchema = ModalityInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 5. Dynamic Schema
export const DynamicInputSchema = z.object({
  dynamic: z.enum(['harmony', 'tension', 'complementary', 'amplification']),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  scoreValue: z.number().min(-1).max(1)
}).strict();

export const DynamicSchema = DynamicInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// 6. EnergyType Schema
export const EnergyTypeInputSchema = z.object({
  energyType: z.string().min(1).max(50).trim(),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  category: z.enum(['spiritual', 'emotional', 'mental', 'physical']),
  intensity: z.number().int().min(1).max(10)
}).strict();

export const EnergyTypeSchema = EnergyTypeInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Type exports
export type Sign = z.infer<typeof SignSchema>;
export type SignInput = z.infer<typeof SignInputSchema>;
export type Planet = z.infer<typeof PlanetSchema>;
export type PlanetInput = z.infer<typeof PlanetInputSchema>;
export type Element = z.infer<typeof ElementSchema>;
export type ElementInput = z.infer<typeof ElementInputSchema>;
export type Modality = z.infer<typeof ModalitySchema>;
export type ModalityInput = z.infer<typeof ModalityInputSchema>;
export type Dynamic = z.infer<typeof DynamicSchema>;
export type DynamicInput = z.infer<typeof DynamicInputSchema>;
export type EnergyType = z.infer<typeof EnergyTypeSchema>;
export type EnergyTypeInput = z.infer<typeof EnergyTypeInputSchema>;

// Validation functions
export const validateSign = (data: unknown) => 
  validateWithError(SignSchema, data, { schema: 'Sign' });
export const validateSignSafe = (data: unknown) => 
  validateSafely(SignSchema, data);

export const validatePlanet = (data: unknown) => 
  validateWithError(PlanetSchema, data, { schema: 'Planet' });
export const validatePlanetSafe = (data: unknown) => 
  validateSafely(PlanetSchema, data);

export const validateElement = (data: unknown) => 
  validateWithError(ElementSchema, data, { schema: 'Element' });
export const validateElementSafe = (data: unknown) => 
  validateSafely(ElementSchema, data);

export const validateModality = (data: unknown) => 
  validateWithError(ModalitySchema, data, { schema: 'Modality' });
export const validateModalitySafe = (data: unknown) => 
  validateSafely(ModalitySchema, data);

export const validateDynamic = (data: unknown) => 
  validateWithError(DynamicSchema, data, { schema: 'Dynamic' });
export const validateDynamicSafe = (data: unknown) => 
  validateSafely(DynamicSchema, data);

export const validateEnergyType = (data: unknown) => 
  validateWithError(EnergyTypeSchema, data, { schema: 'EnergyType' });
export const validateEnergyTypeSafe = (data: unknown) => 
  validateSafely(EnergyTypeSchema, data);