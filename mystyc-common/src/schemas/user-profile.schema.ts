import { z } from 'zod';
import { UserRole } from '../constants/roles.enum';
import { SubscriptionLevel } from '../constants/subscription-levels.enum';
import { validateWithError, validateSafely } from '../util/validation';

export const ZodiacSign = z.enum([
  'Aries',
  'Taurus', 
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces'
]);

export const SubscriptionSchema = z.object({
  level: z.nativeEnum(SubscriptionLevel),
  startDate: z.coerce.date().optional().nullable(),
  creditBalance: z.number().min(0).default(0)
});

export const BirthLocationSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  formattedAddress: z.string(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  timezone: z.object({
    name: z.string(),
    offsetHours: z.number()
  })
});

export const CreateUserProfileSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  email: z.string().email().max(254),
  roles: z.array(z.nativeEnum(UserRole)).min(1),
  subscription: SubscriptionSchema,
  stripeCustomerId: z.string().optional()
}).strict();

export const UserProfileInputSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  email: z.string().email().max(254),
  firstName: z.string()
    .min(1)
    .max(50)
    .trim(),
  lastName: z.string()
    .min(1)
    .max(50)
    .trim(),
  dateOfBirth: z.coerce.date().optional().nullable(),
  timeOfBirth: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format")
    .optional(),
  hasTimeOfBirth: z.boolean().default(false),
  birthLocation: BirthLocationSchema.optional(),
  zodiacSign: ZodiacSign.optional(),
  roles: z.array(z.nativeEnum(UserRole)).min(1),
  subscription: SubscriptionSchema,
  stripeCustomerId: z.string().optional()
}).strict();

export const UserProfileSchema = UserProfileInputSchema.extend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type CreateUserProfileInput = z.infer<typeof CreateUserProfileSchema>;
export type UserProfileInput = z.input<typeof UserProfileInputSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ZodiacSignType = z.infer<typeof ZodiacSign>;
export type BirthLocation = z.infer<typeof BirthLocationSchema>;

export const validateCreateUserProfile = (data: unknown) => 
  validateWithError(CreateUserProfileSchema, data, { schema: 'CreateUserProfile' });
export const validateCreateUserProfileSafe = (data: unknown) => 
  validateSafely(CreateUserProfileSchema, data);
export const validateUserProfile = (data: unknown) => 
  validateWithError(UserProfileSchema, data, { schema: 'UserProfile' });
export const validateUserProfileSafe = (data: unknown) => 
  validateSafely(UserProfileSchema, data);
export const validateUserProfileInput = (data: unknown) => 
  validateWithError(UserProfileInputSchema, data, { schema: 'UserProfileInput' });
export const validateUserProfileInputSafe = (data: unknown) => 
  validateSafely(UserProfileInputSchema, data);