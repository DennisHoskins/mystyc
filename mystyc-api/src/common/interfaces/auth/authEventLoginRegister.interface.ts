import { Device } from '../device.interface';

export interface AuthEventLoginRegister {
  device: Device;
  clientTimestamp: string;
}