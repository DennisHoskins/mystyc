import { z } from 'zod';
import { validateWithError, validateSafely } from '../util/validation';

const FirebaseJwtDataSchema = z.object({
  identities: z.record(z.any()), // [key: string]: any
  sign_in_provider: z.string()
});

export const DecodedIdTokenSchema = z.object({
  uid: z.string().min(20).max(128),
  name: z.string().trim().optional(),
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
  phone_number: z.string().trim().optional(),
  picture: z.string().url().optional(),
  iss: z.string(), // JWT issuer
  sub: z.string(), // JWT subject  
  aud: z.string(), // JWT audience
  iat: z.number().int().positive(), // Unix timestamp
  exp: z.number().int().positive(), // Unix timestamp
  auth_time: z.number().int().positive(), // Unix timestamp
  firebase: FirebaseJwtDataSchema
}).strict();

export type DecodedIdToken = z.infer<typeof DecodedIdTokenSchema>;

export const validateDecodedIdToken = (data: unknown) => 
  validateWithError(DecodedIdTokenSchema, data, { schema: 'DecodedIdToken' });
export const validateDecodedIdTokenSafe = (data: unknown) => 
  validateSafely(DecodedIdTokenSchema, data);