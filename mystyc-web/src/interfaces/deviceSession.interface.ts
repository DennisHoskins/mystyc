import { Device } from '@/interfaces/device.interface';
import { Session } from '@/interfaces/session.interface';

export interface DeviceSession {
  device: Device;
  session: Session | null;
}