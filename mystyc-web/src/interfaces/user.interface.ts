import { FirebaseUser } from './firebaseUser.interface';
import { UserProfile } from './userProfile.interface';
import { Device } from './device.interface';

export interface User {
  firebaseUser: FirebaseUser;
  userProfile: UserProfile;
  device: Device | null;
}