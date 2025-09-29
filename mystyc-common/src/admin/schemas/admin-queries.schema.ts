import { z } from 'zod';
import { validateWithError, validateSafely } from '../../util/validation';

export const BaseAdminQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10000).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
}).strict();

export const AdminStatsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  limit: z.number().int().min(1).max(365).default(30),
  maxRecords: z.coerce.number().int().min(1).default(10000),
  startDate: z.string().optional(),
  endDate: z.string().optional()
}).strict();

export type BaseAdminQuery = z.infer<typeof BaseAdminQuerySchema>;
export type AdminStatsQuery = z.infer<typeof AdminStatsQuerySchema>;

export const validateBaseAdminQuery = (data: unknown) => 
  validateWithError(BaseAdminQuerySchema, data, { schema: 'BaseAdminQuery' });
export const validateAdminStatsQuery = (data: unknown) => 
  validateWithError(AdminStatsQuerySchema, data, { schema: 'AdminStatsQuery' });