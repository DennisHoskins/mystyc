export interface Session {
  authToken: string; 
  refreshToken: string; 
  sessionId: string; 
  deviceId: string; 
  uid: string;
  email: string;
  deviceName: string;
  isAdmin: boolean;
}