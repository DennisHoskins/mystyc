import { User as UserLucide, ShieldUser, UserPlus } from 'lucide-react';

import { UserRole } from 'mystyc-common/constants/roles.enum';
import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';

export default function UserIcon({ size = 6, userProfile }: { size?: number, userProfile?: UserProfile | null }) {
  if (userProfile) {
    if (userProfile.roles.includes(UserRole.ADMIN)) {
      return (
        <ShieldUser className={`w-${size} h-${size}`} />
      );    
    }
    if (userProfile?.subscription.level == "plus") {
      return (
        <UserPlus className={`w-${size} h-${size}`} />
      );    
    }
  }
  return (
    <UserLucide className={`w-${size} h-${size}`} />
  );    
}