export interface DeviceData {
  deviceId: string;
  platform: string;
  timezone: string;
  language: string;
  userAgent: string;
  userAgentParsed?: Record<string, any>;
  fcmToken?: string;
  appVersion?: string;
}