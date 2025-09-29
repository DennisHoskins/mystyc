import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

// Nested object schemas for Sign
const SignBasicsSchema = z.object({
  rulingPlanet: z.enum(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']),
  modernRulingPlanet: z.enum(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']).optional(),
  polarity: z.enum(['Masculine', 'Feminine']),
  naturalHouse: z.number().int().min(1).max(12),
  unicodeSymbol: z.string().min(1).max(5),
  emoji: z.string().min(1).max(5)
}).strict();

const SignTimingSchema = z.object({
  dateRange: z.object({
    start: z.string().min(1),
    end: z.string().min(1)
  }).strict(),
  season: z.string().min(1).max(50),
  seasonDescription: z.string().min(1).max(200)
}).strict();

const SignSymbolSchema = z.object({
  name: z.string().min(1).max(30),
  description: z.string().min(50).max(1000),
  mythologicalStory: z.string().min(100).max(2000),
  mythologicalFigures: z.array(z.string().min(1)).min(1)
}).strict();

const SignGemsSchema = z.object({
  birthstones: z.array(z.string().min(1)).min(1),
  crystals: z.array(z.string().min(1)).min(1),
  meanings: z.array(z.string().min(1)).min(1)
}).strict();

const SignLuckySchema = z.object({
  numbers: z.array(z.number().int()).min(1),
  day: z.string().min(1).max(20),
  times: z.string().min(1).max(50),
  colors: z.array(z.string().min(1)).min(1)
}).strict();

const SignPhysicalSchema = z.object({
  bodyParts: z.array(z.string().min(1)).min(1),
  healthFocus: z.array(z.string().min(1)).min(1),
  exerciseStyles: z.array(z.string().min(1)).min(1)
}).strict();

const SignLifestyleSchema = z.object({
  careers: z.array(z.string().min(1)).min(1),
  hobbies: z.array(z.string().min(1)).min(1),
  cuisines: z.array(z.string().min(1)).min(1),
  musicGenres: z.array(z.string().min(1)).min(1)
}).strict();

const SignTarotSchema = z.object({
  majorArcana: z.string().min(1).max(50),
  courtCards: z.array(z.string().min(1)).min(1),
  minorArcana: z.array(z.string().min(1)).min(1),
  meaning: z.string().min(1).max(200)
}).strict();

const SignAestheticSchema = z.object({
  fashionStyle: z.array(z.string().min(1)).min(1),
  homeDecor: z.array(z.string().min(1)).min(1),
  artStyles: z.array(z.string().min(1)).min(1)
}).strict();

// Sign Schema
export const SignInputSchema = z.object({
  sign: z.enum(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']),
  element: z.enum(['Fire', 'Earth', 'Air', 'Water']),
  modality: z.enum(['Cardinal', 'Fixed', 'Mutable']),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim(),
  basics: SignBasicsSchema,
  timing: SignTimingSchema,
  symbol: SignSymbolSchema,
  gems: SignGemsSchema,
  lucky: SignLuckySchema,
  physical: SignPhysicalSchema,
  lifestyle: SignLifestyleSchema,
  tarot: SignTarotSchema,
  aesthetic: SignAestheticSchema
}).strict();

export const SignSchema = SignInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// Planet Schema
export const PlanetInputSchema = z.object({
  planet: z.enum(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']),
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

// Element Schema (keep existing)
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

// Modality Schema (keep existing)
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

// Dynamic Schema
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

// EnergyType Schema (keep existing)
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

// Polarity Schema
export const PolarityInputSchema = z.object({
  polarity: z.enum(['Masculine', 'Feminine']),
  alternativeName: z.enum(['Yang', 'Yin']),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim()
}).strict();

export const PolaritySchema = PolarityInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

//  House Schema
export const HouseInputSchema = z.object({
  houseNumber: z.number().int().min(1).max(12),
  name: z.string().min(1).max(50).trim(),
  naturalRuler: z.enum(['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']),
  lifeArea: z.string().min(1).max(200).trim(),
  description: z.string().min(50).max(500).trim(),
  keywords: z.array(z.string().min(1).trim()).min(2).max(8),
  energyType: z.string().min(1).max(50).trim()
}).strict();

export const HouseSchema = HouseInputSchema.extend({
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
export type Polarity = z.infer<typeof PolaritySchema>;
export type PolarityInput = z.infer<typeof PolarityInputSchema>;
export type House = z.infer<typeof HouseSchema>;
export type HouseInput = z.infer<typeof HouseInputSchema>;

// Nested object types
export type SignBasics = z.infer<typeof SignBasicsSchema>;
export type SignTiming = z.infer<typeof SignTimingSchema>;
export type SignSymbol = z.infer<typeof SignSymbolSchema>;
export type SignGems = z.infer<typeof SignGemsSchema>;
export type SignLucky = z.infer<typeof SignLuckySchema>;
export type SignPhysical = z.infer<typeof SignPhysicalSchema>;
export type SignLifestyle = z.infer<typeof SignLifestyleSchema>;
export type SignTarot = z.infer<typeof SignTarotSchema>;
export type SignAesthetic = z.infer<typeof SignAestheticSchema>;

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

export const validatePolarity = (data: unknown) => 
  validateWithError(PolaritySchema, data, { schema: 'Polarity' });
export const validatePolaritySafe = (data: unknown) => 
  validateSafely(PolaritySchema, data);

export const validateHouse = (data: unknown) => 
  validateWithError(HouseSchema, data, { schema: 'House' });
export const validateHouseSafe = (data: unknown) => 
  validateSafely(HouseSchema, data);