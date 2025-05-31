export interface AuthEventData {
  deviceId: string;
  firebaseUid: string;
  ip: string;
  platform: string;
  clientTimestamp: string;
  type: 'login' | 'logout' | 'create';
}