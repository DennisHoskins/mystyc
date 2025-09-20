import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

export const OpenAIUsageInputSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  totalRequests: z.number().int().min(0).optional(),
  tokensUsed: z.number().int().min(0),
  tokenUsagePercent: z.number().min(0).max(100),
  costUsed: z.number().min(0), // in USD
  tokenBudget: z.number().int().min(0),
  costBudget: z.number().min(0), // in USD  
  costUsagePercent: z.number().min(0).max(100),
  lastSyncedAt: z.date().optional()
}).strict();

export const OpenAIUsageSchema = OpenAIUsageInputSchema;

export type OpenAIUsageInput = z.input<typeof OpenAIUsageInputSchema>;
export type OpenAIUsage = z.infer<typeof OpenAIUsageSchema>;

export const validateOpenAIUsage = (data: unknown) => 
  validateWithError(OpenAIUsageSchema, data, { schema: 'OpenAIUsage' });
export const validateOpenAIUsageSafe = (data: unknown) => 
  validateSafely(OpenAIUsageSchema, data);
export const validateOpenAIUsageInput = (data: unknown) => 
  validateWithError(OpenAIUsageInputSchema, data, { schema: 'OpenAIUsageInput' });
export const validateOpenAIUsageInputSafe = (data: unknown) => 
  validateSafely(OpenAIUsageInputSchema, data);