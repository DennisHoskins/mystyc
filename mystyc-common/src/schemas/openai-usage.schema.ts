import { z } from 'zod';

export const OpenAIUsageInputSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  totalRequests: z.number().int().min(0),
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

export const validateOpenAIUsage = (data: unknown) => OpenAIUsageSchema.parse(data);
export const validateOpenAIUsageSafe = (data: unknown) => OpenAIUsageSchema.safeParse(data);
export const validateOpenAIUsageInput = (data: unknown) => OpenAIUsageInputSchema.parse(data);
export const validateOpenAIUsageInputSafe = (data: unknown) => OpenAIUsageInputSchema.safeParse(data);