import { User } from '@/interfaces';

export interface App {
 authToken: string | null;
 deviceId: string | null;
 user: User | null;
 fcmToken: string | null;
}
