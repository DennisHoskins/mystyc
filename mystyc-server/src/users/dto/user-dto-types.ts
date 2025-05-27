import { UserProfile } from '@/common/interfaces/userProfile.interface';

/**
 * Base DTO input type that handles JSON-to-interface type mismatches
 * - dateOfBirth comes as string from JSON but stored as Date in database
 */
export interface UserDtoInput extends Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt' | 'dateOfBirth'> {
  dateOfBirth?: string; // JSON input as ISO string, converted to Date by Mongoose
}

/**
 * Create user DTO input - all required fields from UserProfile except auto-generated ones
 */
export interface CreateUserInput extends UserDtoInput {}

/**
 * Update user DTO input - partial updates excluding immutable fields
 */
export interface UpdateUserInput extends Partial<Omit<UserDtoInput, 'firebaseUid' | 'roles'>> {}