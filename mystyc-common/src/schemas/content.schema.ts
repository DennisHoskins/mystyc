import { z } from 'zod';

export const DataItemSchema = z.object({
  key: z.string().min(1).trim(),
  value: z.string().min(1).trim()
}).strict();

export const OpenAIDataSchema = z.object({
  prompt: z.string().optional(),
  model: z.string().optional(),
  inputTokens: z.number().int().min(0).optional(),
  outputTokens: z.number().int().min(0).optional(),
  cost: z.number().min(0).optional(),
  retryCount: z.number().int().min(0).optional()
}).strict();

export const ContentType = z.enum([
  'notification_content', 
  'website_content', 
  'user_content', 
  'plus_content', 
  'pro_content', 
  'blog_content'
]);

export const ContentStatus = z.enum(['pending', 'generated', 'failed', 'fallback']);

export const ContentInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  type: ContentType,
  scheduleId: z.string().optional(),
  executionId: z.string().optional(),
  notificationId: z.string().optional(),
  userId: z.string().min(20).max(128).optional(),
  openAIData: OpenAIDataSchema.optional(),
  title: z.string().min(1).max(200).trim(),
  message: z.string().min(1).max(1000).trim(),
  imageUrl: z.string().url().optional(),
  linkUrl: z.string().url().optional(),
  linkText: z.string().trim().optional(),
  data: z.array(DataItemSchema),
  sources: z.array(z.string().min(1)),
  status: ContentStatus.default('pending'),
  error: z.string().optional(),
  generatedAt: z.date(),
  generationDuration: z.number().int().min(0)
}).strict();

export const ContentSchema = ContentInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type DataItem = z.infer<typeof DataItemSchema>;
export type OpenAIData = z.infer<typeof OpenAIDataSchema>;
export type ContentInput = z.input<typeof ContentInputSchema>;
export type Content = z.infer<typeof ContentSchema>;
export type ContentTypeValue = z.infer<typeof ContentType>;
export type ContentStatusValue = z.infer<typeof ContentStatus>;

export const validateContent = (data: unknown) => ContentSchema.parse(data);
export const validateContentSafe = (data: unknown) => ContentSchema.safeParse(data);
export const validateContentInput = (data: unknown) => ContentInputSchema.parse(data);
export const validateContentInputSafe = (data: unknown) => ContentInputSchema.safeParse(data);