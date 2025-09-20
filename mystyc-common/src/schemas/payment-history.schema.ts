import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

export const PaymentStatus = z.enum(['paid', 'failed', 'refunded', 'disputed']);
export const SubscriptionTier = z.enum(['plus', 'pro']);

export const PaymentHistoryInputSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  stripeCustomerId: z.string().min(1).trim(),
  stripeChargeId: z.string().min(1).trim(),
  stripeInvoiceId: z.string().min(1).trim(),
  stripeSubscriptionId: z.string().min(1).trim().optional().nullable(),
  amount: z.number().int().min(0), // Amount in cents
  currency: z.string().min(3).max(3).toUpperCase().default('USD'), // ISO currency codes
  status: PaymentStatus,
  subscriptionTier: SubscriptionTier,
  paidAt: z.date(),
  periodStart: z.date(),
  periodEnd: z.date()
}).strict();

export const PaymentHistorySchema = PaymentHistoryInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type PaymentHistoryInput = z.input<typeof PaymentHistoryInputSchema>;
export type PaymentHistory = z.infer<typeof PaymentHistorySchema>;
export type PaymentStatusValue = z.infer<typeof PaymentStatus>;
export type SubscriptionTierValue = z.infer<typeof SubscriptionTier>;

export const validatePaymentHistory = (data: unknown) => 
  validateWithError(PaymentHistorySchema, data, { schema: 'PaymentHistory' });
export const validatePaymentHistorySafe = (data: unknown) => 
  validateSafely(PaymentHistorySchema, data);
export const validatePaymentHistoryInput = (data: unknown) => 
  validateWithError(PaymentHistoryInputSchema, data, { schema: 'PaymentHistoryInput' });
export const validatePaymentHistoryInputSafe = (data: unknown) => 
  validateSafely(PaymentHistoryInputSchema, data);