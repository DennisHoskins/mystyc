export interface AuthEvent {
  _id?: string;
  firebaseUid: string;
  fullName?: string;
  deviceId: string;
  deviceName?: string;
  ip: string;
  clientTimestamp: string;
  type: 'login' | 'logout' | 'create';
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}