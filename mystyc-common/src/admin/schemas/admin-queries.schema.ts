import { z } from 'zod';
import { validateWithError, validateSafely } from '../../utils/validation';

export const BaseAdminQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
}).strict();

export const AdminStatsQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
  limit: z.number().int().min(1).max(365).optional().default(30),
  maxRecords: z.number().int().min(1).optional().default(10000),
  startDate: z.string().optional(),
  endDate: z.string().optional()
}).strict();

export type BaseAdminQuery = z.infer<typeof BaseAdminQuerySchema>;
export type AdminStatsQuery = z.infer<typeof AdminStatsQuerySchema>;

export const validateBaseAdminQuery = (data: unknown) => 
  validateWithError(BaseAdminQuerySchema, data, { schema: 'BaseAdminQuery' });
export const validateAdminStatsQuery = (data: unknown) => 
  validateWithError(AdminStatsQuerySchema, data, { schema: 'AdminStatsQuery' });