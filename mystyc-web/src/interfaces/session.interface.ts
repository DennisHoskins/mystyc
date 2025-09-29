export interface Session {
  sessionId: string; 
  deviceId: string; 
  uid: string;
  authToken?: string | null; 
  authTokenTimestamp?: number | null;
  refreshToken?: string | null; 
  refreshTokenTimestamp?: number | null;
  email: string;
  deviceName: string;
  isAdmin: boolean;
  createdAt?: string | number | null;  
  lastUpdated?: string | number | null;  
}