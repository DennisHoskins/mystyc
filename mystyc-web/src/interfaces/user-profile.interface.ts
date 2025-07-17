export interface UserProfile {
  id: string; 
  firebaseUid: string;
  email: string;
  fullName?: string;
  dateOfBirth?: Date | null;
  zodiacSign?: string;
  roles: string[];
  subscription: {
    level: string,
    startDate?: Date | null,
    creditBalance?: number;
  }
  stripeCustomerId?: string;
  createdAt: Date;
  updatedAt: Date;
}