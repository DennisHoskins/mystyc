export interface AuthEventData {
  deviceId: string;
  ip: string;
  platform: string;
  clientTimestamp: string;
  type: 'login' | 'logout' | 'create';
}