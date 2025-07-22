import { z } from 'zod';
import { ScheduleTimeSchema } from './schedule.schema'; // Reuse from schedule schema

export const ScheduleExecutionStatus = z.enum(['running', 'completed', 'failed', 'timeout']);

export const ScheduleExecutionInputSchema = z.object({
  scheduleId: z.string().min(1).max(50),
  eventName: z.string().min(1).max(100).trim(),
  scheduledTime: ScheduleTimeSchema,
  executedAt: z.date(),
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

export const validateScheduleExecution = (data: unknown) => ScheduleExecutionSchema.parse(data);
export const validateScheduleExecutionSafe = (data: unknown) => ScheduleExecutionSchema.safeParse(data);
export const validateScheduleExecutionInput = (data: unknown) => ScheduleExecutionInputSchema.parse(data);
export const validateScheduleExecutionInputSafe = (data: unknown) => ScheduleExecutionInputSchema.safeParse(data);