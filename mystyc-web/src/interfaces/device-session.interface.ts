import { Device } from 'mystyc-common/schemas/';
import { Session } from '@/interfaces/session.interface';

export interface DeviceSession {
  device: Device;
  session: Session | null;
}