export interface Session {
  sessionId: string; 
  deviceId: string; 
  uid: string;
  authToken: string; 
  authTokenTimestamp: number;
  refreshToken: string; 
  refreshTokenTimestamp: number;
  email: string;
  deviceName: string;
  isAdmin: boolean;
  createdAt: number;  
  lastUpdated: number;  
}