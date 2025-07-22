import { z } from 'zod';

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

export const validateSchedule = (data: unknown) => ScheduleSchema.parse(data);
export const validateScheduleSafe = (data: unknown) => ScheduleSchema.safeParse(data);
export const validateScheduleInput = (data: unknown) => ScheduleInputSchema.parse(data);
export const validateScheduleInputSafe = (data: unknown) => ScheduleInputSchema.safeParse(data);