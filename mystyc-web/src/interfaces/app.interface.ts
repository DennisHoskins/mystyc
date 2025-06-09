import { User } from "./user.interface";

export interface App {
 authToken: string | null;
 user: User | null;
 fcmToken: string | null;
}
