import { Device } from '../device.interface';

export interface AuthEventLoginRegister {
  firebaseUid: string,
  device: Device
  clientTimestamp: string
}