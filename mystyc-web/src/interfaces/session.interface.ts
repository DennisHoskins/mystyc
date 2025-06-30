export interface Session {
  sessionId: string; 
  deviceId: string; 
  uid: string;
  authToken: string; 
  refreshToken: string; 
  fcmToken: string; 
  email: string;
  deviceName: string;
  isAdmin: boolean;
}