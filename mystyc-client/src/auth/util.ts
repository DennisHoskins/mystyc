import { UserProfile } from '@/interfaces/userProfile.interface';

export function isUserOnboarded(userProfile: UserProfile | null | undefined): boolean {
  return Boolean(userProfile?.fullName && userProfile?.dateOfBirth && userProfile.zodiacSign);
}

export function isUserAdmin(userProfile: UserProfile | null | undefined): boolean {
  return Array.isArray(userProfile?.roles) && userProfile.roles.includes('admin');
}