export interface UserProfile {
  id: string; 
  firebaseUid: string;
  email: string;
  fullName?: string;
  dateOfBirth?: Date | null;
  zodiacSign?: string;
  roles?: string[];
  createdAt: Date;
  updatedAt: Date;
}
