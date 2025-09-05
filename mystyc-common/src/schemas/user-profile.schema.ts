import { z } from 'zod';
import { UserRole } from '../constants/roles.enum';
import { SubscriptionLevel } from '../constants/subscription-levels.enum';
import { validateWithError, validateSafely } from '../util/validation';
import { AstrologyCalculatedSchema } from './astrology.schema';

// Reusable base schemas
const BaseNameSchema = z.string()
  .min(1, "Name is required")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z\s\-'\.]+$/, "Can only contain letters, spaces, hyphens, and apostrophes")
  .trim();

const BasePersonSchema = z.object({
  firstName: BaseNameSchema.optional(),
  lastName: BaseNameSchema.optional(),
});

export const SubscriptionSchema = z.object({
  level: z.nativeEnum(SubscriptionLevel, {
    errorMap: () => ({ message: "Invalid subscription level" })
  }),
  startDate: z.coerce.date().optional().nullable(),
  creditBalance: z.number().min(0, "Credit balance cannot be negative").default(0)
});

export const BirthLocationSchema = z.object({
  placeId: z.string().min(1, "Place ID is required"),
  name: z.string().min(1, "Location name is required"),
  formattedAddress: z.string().min(1, "Address is required"),
  coordinates: z.object({
    lat: z.number().min(-90).max(90, "Invalid latitude"),
    lng: z.number().min(-180).max(180, "Invalid longitude")
  }),
  timezone: z.object({
    name: z.string().min(1, "Timezone name is required"),
    offsetHours: z.number().min(-12).max(14, "Invalid timezone offset")
  })
});

export const CreateUserProfileSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  email: z.string().email().max(254),
  roles: z.array(z.nativeEnum(UserRole)).min(1),
  subscription: SubscriptionSchema,
  stripeCustomerId: z.string().optional()
}).strict();

export const UserProfileInputSchema = BasePersonSchema.extend({
  firebaseUid: z.string().min(20).max(128),
  email: z.string().email().max(254),
  dateOfBirth: z.coerce.date()
    .min(new Date('1900-01-01'), "Birth date cannot be before 1900")
    .max(new Date(), "Birth date cannot be in the future")
    .optional()
    .nullable(),
  timeOfBirth: z.string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:mm format")
    .optional(),
  hasTimeOfBirth: z.boolean().default(false),
  birthLocation: BirthLocationSchema.optional(),
  astrology: AstrologyCalculatedSchema.optional(),
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