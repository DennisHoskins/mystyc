import { SubscriptionLevel } from "../enums/subscription-levels.enum";

export interface UserProfile {
  id: string; 
  firebaseUid: string;
  email: string;
  fullName?: string;
  dateOfBirth?: Date | null;
  zodiacSign?: string;
  roles: string[];
  subscription: {
    level: SubscriptionLevel,
    startDate?: Date | null,
    creditBalance?: number;
  }
  createdAt: Date;
  updatedAt: Date;
}