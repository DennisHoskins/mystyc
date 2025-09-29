import { z } from 'zod';
import { UserProfileInputSchema } from "../user-profile.schema";
import { SubscriptionLevel } from '../../constants/subscription-levels.enum';

export const UpdateUserProfileSchema = UserProfileInputSchema.partial().omit({
  firebaseUid: true,
  roles: true
}).strict();

export const SubscriptionTierUpdateSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  level: z.nativeEnum(SubscriptionLevel),
  startDate: z.string().datetime().optional()
}).strict();

export const CreditBalanceUpdateSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  credits: z.number().min(0)
}).strict();

export const StartSubscriptionSchema = z.object({
  priceId: z.string().min(1)
}).strict();

export const BillingPortalSchema = z.object({
  returnUrl: z.string().url()
}).strict();

export const ServerLogoutSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  deviceId: z.string().min(8).max(64),
  timestamp: z.string().datetime()
}).strict();
