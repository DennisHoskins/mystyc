import { UserRole } from './userRole.interface';

export interface UserProfile {
  id: string; 
  firebaseUid: string;
  email: string;
  fullName?: string;
  dateOfBirth?: Date | null;
  zodiacSign?: string;
  roles: UserRole[];
  createdAt: Date;
  updatedAt: Date;
}