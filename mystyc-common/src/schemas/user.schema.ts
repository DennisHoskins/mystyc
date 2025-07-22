import { z } from 'zod';
import { FirebaseUserSchema } from './firebase-user.schema';
import { UserProfileSchema } from './user-profile.schema';
import { DeviceSchema } from './device.schema';

export const UserSchema = z.object({
  firebaseUser: FirebaseUserSchema,
  userProfile: UserProfileSchema,
  device: DeviceSchema.nullable()
}).strict();

export type User = z.infer<typeof UserSchema>;

export const validateUser = (data: unknown) => UserSchema.parse(data);
export const validateUserSafe = (data: unknown) => UserSchema.safeParse(data);