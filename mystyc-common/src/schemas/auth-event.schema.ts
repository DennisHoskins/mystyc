import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

export const AuthEventType = z.enum(['create', 'login', 'logout', 'server-logout']);

export const AuthEventInputSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  email: z.string().email().optional(),
  deviceId: z.string().min(8).max(64),
  deviceName: z.string().trim().optional(),
  ip: z.string().min(7).max(45), // IPv4 min "1.1.1.1", IPv6 max length
  clientTimestamp: z.string().datetime(), // ISO date string
  type: AuthEventType
}).strict();

export const AuthEventSchema = AuthEventInputSchema.extend({
  _id: z.string().optional(),
  timestamp: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

export type AuthEventInput = z.input<typeof AuthEventInputSchema>;
export type AuthEvent = z.infer<typeof AuthEventSchema>;
export type AuthEventTypeValue = z.infer<typeof AuthEventType>;

export const validateAuthEvent = (data: unknown) => 
  validateWithError(AuthEventSchema, data, { schema: 'AuthEvent' });
export const validateAuthEventSafe = (data: unknown) => 
  validateSafely(AuthEventSchema, data);
export const validateAuthEventInput = (data: unknown) => 
  validateWithError(AuthEventInputSchema, data, { schema: 'AuthEventInput' });
export const validateAuthEventInputSafe = (data: unknown) => 
  validateSafely(AuthEventInputSchema, data);