import { User } from "./user.interface";

export type ServerUser = 
  | null  // logged out
  | { user: null, authenticated: true }  // logged in with a problem
  | { user: User; authenticated: true };  // logged in and working
