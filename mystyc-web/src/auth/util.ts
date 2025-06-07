import { UserProfile } from '@/interfaces/userProfile.interface';
import { UserRole } from '@/interfaces/userRole.interface';

export function isUserOnboarded(userProfile: UserProfile | null | undefined): boolean {
  return Boolean(userProfile?.fullName && userProfile?.dateOfBirth && userProfile.zodiacSign);
}

export function isUserAdmin(userProfile: UserProfile | null | undefined): boolean {
  return Array.isArray(userProfile?.roles) && userProfile.roles.includes(UserRole.ADMIN);
}