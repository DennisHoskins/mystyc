import { Device } from '@/interfaces/device.interface';

export interface DeviceSession {
  device: Device;
  sessionId?: string;
  deviceId?: string;
  uid?: string;
  email?: string;
  authToken?: string;
  retryToken?: string;
  fcmToken?: string;
}