import { z } from 'zod';
import { ScheduleTimeSchema } from './schedule.schema'; // Reuse from schedule schema
import { validateWithError, validateSafely } from '../util/validation';

export const ScheduleExecutionStatus = z.enum(['running', 'completed', 'failed', 'timeout']);

export const ScheduleExecutionInputSchema = z.object({
  scheduleId: z.string().min(1).max(50),
  eventName: z.string().min(1).max(100).trim(),
  scheduledTime: ScheduleTimeSchema,
  executedAt: z.date().optional(),
  timezone: z.string().min(1).max(50).optional(),
  localTime: z.date().optional(),
  status: ScheduleExecutionStatus.default('running'),
  error: z.string().optional(),
  duration: z.number().int().min(0).optional()
}).strict();

export const ScheduleExecutionSchema = ScheduleExecutionInputSchema.extend({
  _id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type ScheduleExecutionInput = z.input<typeof ScheduleExecutionInputSchema>;
export type ScheduleExecution = z.infer<typeof ScheduleExecutionSchema>;
export type ScheduleExecutionStatusValue = z.infer<typeof ScheduleExecutionStatus>;

export const validateScheduleExecution = (data: unknown) => 
  validateWithError(ScheduleExecutionSchema, data, { schema: 'ScheduleExecution' });
export const validateScheduleExecutionSafe = (data: unknown) => 
  validateSafely(ScheduleExecutionSchema, data);
export const validateScheduleExecutionInput = (data: unknown) => 
  validateWithError(ScheduleExecutionInputSchema, data, { schema: 'ScheduleExecutionInput' });
export const validateScheduleExecutionInputSafe = (data: unknown) => 
  validateSafely(ScheduleExecutionInputSchema, data);