'use client';

import { User as UserLucide, ShieldUser } from 'lucide-react';

import { UserProfile } from '@/interfaces/user-profile.interface';

export default function UserIcon({ size = 6, userProfile }: { size?: number, userProfile?: UserProfile | null }) {
  if (userProfile) {
    if (userProfile.roles.includes("admin")) {
      return (
        <ShieldUser className={`w-${size} h-${size} text-gray-500`} />
      );    
    }
  }
  return (
    <UserLucide className={`w-${size} h-${size} text-gray-500`} />
  );    
}