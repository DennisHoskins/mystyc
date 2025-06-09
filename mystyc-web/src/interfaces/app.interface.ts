import { User } from '@/interfaces';

export interface App {
 deviceId: string | null;
 user: User | null;
 fcmToken: string | null;
}
