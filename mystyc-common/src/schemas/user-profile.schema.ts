import { z } from 'zod';
import { UserRole } from '../constants/roles.enum';
import { SubscriptionLevel } from '../constants/subscription-levels.enum';

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

const SubscriptionSchema = z.object({
  level: z.nativeEnum(SubscriptionLevel),
  startDate: z.coerce.date().optional().nullable(),
  creditBalance: z.number().min(0).default(0)
});

export const UserProfileInputSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  email: z.string().email().max(254),
  fullName: z.string()
    .min(1)
    .max(100)
    .trim()
    .optional(),
  dateOfBirth: z.coerce.date().optional().nullable(),
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

export type UserProfileInput = z.input<typeof UserProfileInputSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type ZodiacSignType = z.infer<typeof ZodiacSign>;

export const validateUserProfile = (data: unknown) => UserProfileSchema.parse(data);
export const validateUserProfileSafe = (data: unknown) => UserProfileSchema.safeParse(data);