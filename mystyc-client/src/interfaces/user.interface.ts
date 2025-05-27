import { UserProfile } from './userProfile.interface';
import { FirebaseUser } from './firebaseUser.interface';

export interface User {
  firebaseUser: FirebaseUser;
  userProfile: UserProfile;
}