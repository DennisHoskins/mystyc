import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

export const ScheduleTimeSchema = z.object({
  hour: z.number().int().min(0).max(23),
  minute: z.number().int().min(0).max(59)
}).strict();

export const ScheduleInputSchema = z.object({
  time: ScheduleTimeSchema,
  event_name: z.string().min(1).max(100).trim(),
  enabled: z.boolean().default(true),
  timezone_aware: z.boolean().default(false)
}).strict();

export const ScheduleSchema = ScheduleInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type ScheduleTime = z.infer<typeof ScheduleTimeSchema>;
export type ScheduleInput = z.input<typeof ScheduleInputSchema>;
export type Schedule = z.infer<typeof ScheduleSchema>;

export const validateSchedule = (data: unknown) => 
  validateWithError(ScheduleSchema, data, { schema: 'Schedule' });
export const validateScheduleSafe = (data: unknown) => 
  validateSafely(ScheduleSchema, data);
export const validateScheduleInput = (data: unknown) => 
  validateWithError(ScheduleInputSchema, data, { schema: 'ScheduleInput' });
export const validateScheduleInputSafe = (data: unknown) => 
  validateSafely(ScheduleInputSchema, data);