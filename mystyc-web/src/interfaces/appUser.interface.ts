import { User } from '@/interfaces';

export interface AppUser extends User {
 isOnboard: boolean;
 isAdmin: boolean;
}
