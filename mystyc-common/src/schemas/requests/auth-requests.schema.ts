import { z } from 'zod';
import { DeviceInputSchema } from '../device.schema';

export const LoginRegisterRequestSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  device: DeviceInputSchema,
  clientTimestamp: z.string().datetime()
}).strict();

export const LogoutRequestSchema = z.object({
  firebaseUid: z.string().min(20).max(128),
  device: DeviceInputSchema,
  clientTimestamp: z.string().datetime()
}).strict();