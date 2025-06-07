export interface AuthEvent {
  _id?: string;
  firebaseUid: string;
  deviceId: string;
  ip: string;
  platform: string;
  clientTimestamp: string;
  type: 'login' | 'logout' | 'create';
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}