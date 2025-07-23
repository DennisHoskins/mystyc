import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

export const FirebaseUserSchema = z.object({
  uid: z.string().min(20).max(128),
  email: z.string().email().optional(),
  displayName: z.string().trim().optional(),
  photoURL: z.string().url().optional(),
  emailVerified: z.boolean().optional()
}).strict();

export type FirebaseUser = z.infer<typeof FirebaseUserSchema>;

export const validateFirebaseUser = (data: unknown) => 
  validateWithError(FirebaseUserSchema, data, { schema: 'FirebaseUser' });
export const validateFirebaseUserSafe = (data: unknown) => 
  validateSafely(FirebaseUserSchema, data);