import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';
import { AstrologyCalculatedSchema } from './astrology.schema';

export const HoroscopeInputSchema = z.object({
  userId: z.string().min(20).max(128),  // Firebase UID
  date: z.coerce.date(),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format"),
  timezone: z.string().min(1),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  }),
  personalChart: AstrologyCalculatedSchema,  // User's daily energy
  cosmicChart: AstrologyCalculatedSchema     // Reference cosmic energy
}).strict();

export const HoroscopeSchema = HoroscopeInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export const HoroscopeRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD format"),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
}).strict();

export type HoroscopeInput = z.infer<typeof HoroscopeInputSchema>;
export type HoroscopeSchema = z.infer<typeof HoroscopeSchema>;
export type HoroscopeRequestSchema = z.infer<typeof HoroscopeRequestSchema>;

export const validateHoroscope = (data: unknown) => 
  validateWithError(HoroscopeSchema, data, { schema: 'Horoscope' });
export const validateHoroscopeSafe = (data: unknown) => 
  validateSafely(HoroscopeSchema, data);