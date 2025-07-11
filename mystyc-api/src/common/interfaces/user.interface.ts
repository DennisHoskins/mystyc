import { FirebaseUser } from './firebase-user.interface';
import { UserProfile } from './user-profile.interface';
import { Device } from './device.interface';

export interface User {
  firebaseUser: FirebaseUser;
  userProfile: UserProfile;
  device: Device | null;
}