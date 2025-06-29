export interface AuthEvent {
  _id?: string;
  userId: string;
  email?: string;
  deviceId: string;
  deviceName?: string;
  ip: string;
  clientTimestamp: string;
  type: 'create' | 'login' | 'logout' | 'server-logout';
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}