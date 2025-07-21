import { Device } from 'mystyc-common';
import { Session } from '@/interfaces/session.interface';

export interface DeviceSession {
  device: Device;
  session: Session | null;
}