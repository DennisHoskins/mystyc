import { User } from 'mystyc-common/schemas/user.schema';

export interface AppUser extends User {
 isOnboard: boolean;
 isPlus: boolean;
 isAdmin: boolean;
}
