import { User } from '@/interfaces';

export interface AppUser extends User {
 isOnboard: boolean;
 isPlus: boolean;
 isAdmin: boolean;
}
