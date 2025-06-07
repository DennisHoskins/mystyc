import { Device } from './device.interface';
import { AuthEvent } from './authEvent.interface';

export interface RegisterSession {
  device: Device;
  authEvent: AuthEvent;
}